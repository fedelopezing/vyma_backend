import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ActivationToken } from './entities/activation-token.entity';
import { UsersService } from './users.service';
import { ActivationTokensService } from './activation-tokens.service';
import { UsersController } from './users.controller';
import { UserCreatedListener } from './listeners/user-created.listener';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, ActivationToken]), EmailModule],
  controllers: [UsersController],
  providers: [UsersService, ActivationTokensService, UserCreatedListener],
  exports: [TypeOrmModule, UsersService, ActivationTokensService],
})
export class UsersModule {}
