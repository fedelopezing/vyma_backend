import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MembersController } from './members.controller';
import { AdminMembersController } from './admin-members.controller';
import { MembersService } from './members.service';
import { AdminMembersService } from './admin-members.service';
import { MembersRepository } from './repositories/members.repository';
import { MEMBERS_REPOSITORY } from './interfaces/i-members-repository.interface';
import { MemberNotificationsListener } from './listeners/member-notifications.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  controllers: [MembersController, AdminMembersController],
  providers: [
    MembersService,
    AdminMembersService,
    MemberNotificationsListener,
    {
      provide: MEMBERS_REPOSITORY,
      useClass: MembersRepository,
    },
  ],
  exports: [MembersService, AdminMembersService],
})
export class MembersModule {}
