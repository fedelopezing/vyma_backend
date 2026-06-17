import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

/**
 * SchedulesService — Stub implementation.
 * Signatures include companyId as mandatory tenant filter
 * to enforce multi-tenant isolation per RFC-004.
 * Full implementation pending when SchedulesRepository is added.
 */
@Injectable()
export class SchedulesService {
  create(_createScheduleDto: CreateScheduleDto, _companyId: number): string {
    return 'This action adds a new schedule';
  }

  findAll(_companyId: number): string {
    return `This action returns all schedules`;
  }

  findOne(id: number, _companyId: number): string {
    return `This action returns a #${id} schedule`;
  }

  update(
    id: number,
    _updateScheduleDto: UpdateScheduleDto,
    _companyId: number,
  ): string {
    return `This action updates a #${id} schedule`;
  }

  remove(id: number, _companyId: number): string {
    return `This action removes a #${id} schedule`;
  }
}
