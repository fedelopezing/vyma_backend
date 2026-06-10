import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getErrorStack } from '../common/helpers/errors.helper';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginUserDto, ActivateAccountDto } from './dto';
import { JwtPayload } from './interfaces';
import { UsersService } from '../users/users.service';
import { ActivationTokensService } from '../users/activation-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { randomUUID } from 'crypto';
import { runInTransaction } from '../common/helpers/transaction.helper';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly activationTokensService: ActivationTokensService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  async activateAccount(activateDto: ActivateAccountDto) {
    return runInTransaction(this.dataSource, async (qr) => {
      const { token, password } = activateDto;

      const activeToken =
        await this.activationTokensService.findActiveToken(token);
      if (!activeToken) {
        throw new BadRequestException('Token inválido o expirado');
      }

      if (activeToken.expiresAt < new Date()) {
        throw new BadRequestException('El token ha expirado');
      }

      const userRepo = qr.manager.getRepository(User);
      const user = activeToken.user;

      user.passwordHash = await bcrypt.hash(password, 10);
      user.isActive = true;
      await userRepo.save(user);

      await this.activationTokensService.markAsUsed(activeToken.id, qr.manager);

      return { message: 'Account activated successfully' };
    });
  }

  async login(
    loginUserDto: LoginUserDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
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

    return this.generateTokens(user, ipAddress, userAgent);
  }

  async refreshTokens(token: string, ipAddress?: string, userAgent?: string) {
    const refreshTokenRecord = await this.refreshTokenRepo.findOne({
      where: { uuid: token },
      relations: ['user', 'user.role'],
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshTokenRecord.isRevoked) {
      await this.refreshTokenRepo.update(
        { user: { id: refreshTokenRecord.user.id } },
        { isRevoked: true },
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

    return this.generateTokens(user, ipAddress, userAgent);
  }

  async logout(token: string) {
    const refreshTokenRecord = await this.refreshTokenRepo.findOne({
      where: { uuid: token },
    });

    if (refreshTokenRecord) {
      refreshTokenRecord.isRevoked = true;
      await this.refreshTokenRepo.save(refreshTokenRecord);
    }

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role?.name || 'client',
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
      },
    };
  }

  handleDBErrors(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as Record<string, unknown>).code === '23505'
    ) {
      throw new ConflictException(
        'El email ya está en uso. Por favor, usa otro.',
      );
    }

    this.logger.error('Unexpected database error', getErrorStack(error));
    throw new InternalServerErrorException(
      'Error inesperado, revise los logs del servidor',
    );
  }
}
