import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ProfilesModule } from '../profiles/profiles.module';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UsersModule } from '../users/users.module';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesService, PermissionsService],
  imports: [
    ConfigModule,
    forwardRef(() => ProfilesModule),
    CommonModule,
    UsersModule,

    TypeOrmModule.forFeature([Role, Permission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    AuthService,
    RolesService,
    PermissionsService,
  ],
})
export class AuthModule {}
