import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: configService.get('JWT_ISSUER'),
      audience: configService.get('JWT_AUDIENCE'),
    });
  }

  /**
   * Validates the JWT and hydrates req.user with the full payload.
   * The payload already contains companyId, companyUuid and isSuperAdmin
   * (set at token-issue time by AuthService), so no extra DB lookup is needed
   * for those fields. We do check that the user is still active.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { sub } = payload;

    const user = await this.usersService.findOneById(sub);

    if (!user) throw new UnauthorizedException('Token not valid');

    if (!user.isActive)
      throw new UnauthorizedException('User is inactive, talk with an admin');

    // Return the payload directly — Passport sets this as req.user.
    // All multi-tenant fields (companyId, companyUuid, isSuperAdmin) are
    // already present in the signed payload.
    return {
      sub: payload.sub,
      uuid: payload.uuid,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      companyUuid: payload.companyUuid,
      isSuperAdmin: payload.isSuperAdmin ?? false,
    };
  }
}
