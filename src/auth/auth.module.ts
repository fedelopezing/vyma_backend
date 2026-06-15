import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CompaniesModule } from '../companies/companies.module';

import { RoleCacheListener } from './listeners/role-cache.listener';
import { TokenCleanupCron } from './cron/token-cleanup.cron';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RoleCacheListener,
    TokenCleanupCron,
    RefreshTokenRepository,
  ],
  imports: [
    ConfigModule,
    forwardRef(() => ProfilesModule),
    CommonModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    forwardRef(() => CompaniesModule),

    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '15m',
            issuer: configService.get('JWT_ISSUER'),
            audience: configService.get('JWT_AUDIENCE'),
          },
        };
      },
    }),
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    JwtModule,
    AuthService,
    RolesModule,
    PermissionsModule,
    RefreshTokenRepository,
  ],
})
export class AuthModule {}
