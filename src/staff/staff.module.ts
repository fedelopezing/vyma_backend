import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffMember } from './entities/staff-member.entity';
import { StaffRepository } from './repositories/staff.repository';
import { STAFF_REPOSITORY } from './interfaces/i-staff-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([StaffMember])],
  controllers: [StaffController],
  providers: [
    StaffService,
    {
      provide: STAFF_REPOSITORY,
      useClass: StaffRepository,
    },
  ],
  exports: [StaffService],
})
export class StaffModule {}
