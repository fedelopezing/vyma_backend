import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  create(_createScheduleDto: CreateScheduleDto): string {
    return 'This action adds a new schedule';
  }

  findAll(): string {
    return `This action returns all schedules`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} schedule`;
  }

  update(id: number, _updateScheduleDto: UpdateScheduleDto): string {
    return `This action updates a #${id} schedule`;
  }

  remove(id: number): string {
    return `This action removes a #${id} schedule`;
  }
}
