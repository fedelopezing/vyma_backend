import { Module } from '@nestjs/common';

import { ScheduleBreaksService } from './schedule-breaks.service';
import { ScheduleBreaksController } from './schedule-breaks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleBreak } from './entities/schedule-break.entity';

@Module({
  controllers: [ScheduleBreaksController],
  providers: [ScheduleBreaksService],
  imports: [
    TypeOrmModule.forFeature([ScheduleBreak]),
  ],
})
export class ScheduleBreaksModule {}
