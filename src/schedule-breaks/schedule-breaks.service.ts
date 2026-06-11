import { Injectable } from '@nestjs/common';
import { CreateScheduleBreakDto } from './dto/create-schedule-break.dto';
import { UpdateScheduleBreakDto } from './dto/update-schedule-break.dto';

@Injectable()
export class ScheduleBreaksService {
  create(_createScheduleBreakDto: CreateScheduleBreakDto): string {
    return 'This action adds a new scheduleBreak';
  }

  findAll(): string {
    return `This action returns all scheduleBreaks`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} scheduleBreak`;
  }

  update(id: number, _updateScheduleBreakDto: UpdateScheduleBreakDto): string {
    return `This action updates a #${id} scheduleBreak`;
  }

  remove(id: number): string {
    return `This action removes a #${id} scheduleBreak`;
  }
}
