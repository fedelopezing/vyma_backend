import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ActivationToken } from './entities/activation-token.entity';
import { UsersService } from './users.service';
import { ActivationTokensService } from './activation-tokens.service';
import { UsersController } from './users.controller';
import { UserCreatedListener } from './listeners/user-created.listener';
import { UsersRepository } from './repositories/users.repository';
import { ActivationTokensRepository } from './repositories/activation-tokens.repository';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ActivationToken]),
    EmailModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ActivationTokensService,
    UserCreatedListener,
    UsersRepository,
    ActivationTokensRepository,
  ],
  exports: [
    TypeOrmModule,
    UsersService,
    ActivationTokensService,
    UsersRepository,
    ActivationTokensRepository,
  ],
})
export class UsersModule {}
