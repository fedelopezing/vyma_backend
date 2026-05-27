import { Injectable } from '@nestjs/common';
import { CreateScheduleBreakDto } from './dto/create-schedule-break.dto';
import { UpdateScheduleBreakDto } from './dto/update-schedule-break.dto';

@Injectable()
export class ScheduleBreaksService {
  create(_createScheduleBreakDto: CreateScheduleBreakDto) {
    return 'This action adds a new scheduleBreak';
  }

  findAll() {
    return `This action returns all scheduleBreaks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scheduleBreak`;
  }

  update(id: number, _updateScheduleBreakDto: UpdateScheduleBreakDto) {
    return `This action updates a #${id} scheduleBreak`;
  }

  remove(id: number) {
    return `This action removes a #${id} scheduleBreak`;
  }
}
