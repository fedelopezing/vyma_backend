import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  LoginUserDto,
  ActivateAccountDto,
  ResendActivationDto,
  SelectCompanyDto,
} from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  JwtPayload,
  LoginResponse,
  SelectionResponse,
  MessageResponse,
  CompanyPreview,
} from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ActivationTokensService } from '../users/activation-tokens.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';
import { randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { UserCompany } from '../companies/entities/user-company.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly activationTokensService: ActivationTokensService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly userCompanyRepository: UserCompanyRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async activateAccount(
    activateDto: ActivateAccountDto,
  ): Promise<MessageResponse> {
    return this.refreshTokenRepo.runTransaction(async (manager) => {
      const { token, password } = activateDto;

      const activeToken =
        await this.activationTokensService.findActiveToken(token);
      if (!activeToken) {
        throw new BadRequestException('Token inválido o expirado');
      }

      if (activeToken.expiresAt < new Date()) {
        throw new BadRequestException('El token ha expirado');
      }

      const userRepo = manager.getRepository(User);
      const user = activeToken.user;

      user.passwordHash = await bcrypt.hash(password, 10);
      user.isActive = true;
      await userRepo.save(user);

      await this.activationTokensService.markAsUsed(activeToken.id, manager);

      return { message: 'Account activated successfully' };
    });
  }

  async resendActivation(
    resendDto: ResendActivationDto,
  ): Promise<MessageResponse> {
    const { email } = resendDto;

    const user = await this.usersService.findOneByEmailForLogin(email);

    if (user && !user.isActive) {
      const rawToken = await this.activationTokensService.createToken(user.id);

      this.eventEmitter.emit('user.created', {
        user,
        activationToken: rawToken,
      });
    }

    return {
      message:
        'Si el correo electrónico está registrado, se enviará un enlace de activación',
    };
  }

  async login(
    loginUserDto: LoginUserDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse | SelectionResponse> {
    const { password, email } = loginUserDto;

    const user = await this.usersService.findOneByEmailForLogin(email);

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // ── Multi-tenant: consult memberships ─────────────────────────────────
    const memberships =
      await this.userCompanyRepository.findMembershipsByUserId(user.id);

    if (memberships.length === 0) {
      throw new UnauthorizedException('User has no company memberships');
    }

    // ── Case A: single membership — emit full JWT ──────────────────────────
    if (memberships.length === 1) {
      return this.generateTokens(user, memberships[0], ipAddress, userAgent);
    }

    // ── Case B: multiple memberships — emit selection token ───────────────
    return this.generateSelectionToken(user, memberships);
  }

  async selectCompany(
    selectionToken: string,
    dto: SelectCompanyDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(selectionToken);
    } catch {
      throw new UnauthorizedException('Selection token is invalid or expired');
    }

    // Find the requested company among all user memberships
    const memberships =
      await this.userCompanyRepository.findMembershipsByUserId(payload.sub);

    const membership = memberships.find(
      (m) => m.company?.uuid === dto.companyUuid,
    );

    if (!membership) {
      throw new ForbiddenException(
        'User is not a member of the selected company',
      );
    }

    const isMember = await this.userCompanyRepository.isActiveMember(
      payload.sub,
      membership.companyId,
    );

    if (!isMember) {
      throw new ForbiddenException(
        'User is not a member of the selected company',
      );
    }

    const user = await this.usersService.findOneById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.generateTokens(user, membership, ipAddress, userAgent);
  }

  async refreshTokens(
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const refreshTokenRecord =
      await this.refreshTokenRepo.findOneByTokenWithUser(token);

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshTokenRecord.isRevoked) {
      await this.refreshTokenRepo.updateRevokeStatusByUser(
        refreshTokenRecord.user.id,
        true,
      );
      throw new UnauthorizedException(
        'Refresh token was revoked. All sessions terminated.',
      );
    }

    if (refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    refreshTokenRecord.isRevoked = true;
    await this.refreshTokenRepo.save(refreshTokenRecord);

    const user = await this.usersService.findOneById(
      refreshTokenRecord.user.id,
    );
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Refresh tokens don't re-select company; keep the first active membership
    const memberships =
      await this.userCompanyRepository.findMembershipsByUserId(user.id);

    if (memberships.length === 0) {
      throw new UnauthorizedException('User has no company memberships');
    }

    return this.generateTokens(user, memberships[0], ipAddress, userAgent);
  }

  async logout(token: string): Promise<MessageResponse> {
    const refreshTokenRecord =
      await this.refreshTokenRepo.findOneByToken(token);

    if (refreshTokenRecord) {
      refreshTokenRecord.isRevoked = true;
      await this.refreshTokenRepo.save(refreshTokenRecord);
    }

    return { message: 'Logged out successfully' };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async generateTokens(
    user: User,
    membership: UserCompany,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role?.name || membership.role?.name || 'client',
      companyId: membership.companyId,
      companyUuid: membership.company?.uuid,
      isSuperAdmin: user.isSuperAdmin ?? false,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenRaw = randomUUID();
    const tokenHash = await bcrypt.hash(refreshTokenRaw, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshToken = this.refreshTokenRepo.create({
      uuid: refreshTokenRaw,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
      user: { id: user.id },
    });

    await this.refreshTokenRepo.save(newRefreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: 900,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        company: membership.company
          ? {
              id: membership.company.id,
              uuid: membership.company.uuid,
              name: membership.company.name,
            }
          : undefined,
      },
    };
  }

  private generateSelectionToken(
    user: User,
    memberships: UserCompany[],
  ): SelectionResponse {
    // Short-lived JWT (5 min) without companyId — used to identify user in select-company endpoint
    const selectionPayload: JwtPayload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role?.name || 'client',
      isSuperAdmin: user.isSuperAdmin ?? false,
    };

    const selectionToken = this.jwtService.sign(selectionPayload, {
      expiresIn: '5m',
    });

    const companies: CompanyPreview[] = memberships
      .filter((m) => m.company != null)
      .map((m) => ({
        id: m.company.id,
        uuid: m.company.uuid,
        name: m.company.name,
      }));

    return {
      requiresCompanySelection: true,
      selectionToken,
      companies,
    };
  }
}
