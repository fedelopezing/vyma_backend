import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleBreakDto } from './create-schedule-break.dto';

export class UpdateScheduleBreakDto extends PartialType(CreateScheduleBreakDto) {}
