import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from './entities/schedule.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [TypeOrmModule.forFeature([Schedule]), CompaniesModule],
})
export class SchedulesModule {}
