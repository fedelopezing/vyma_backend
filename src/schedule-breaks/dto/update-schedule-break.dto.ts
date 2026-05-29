import { PartialType } from '@nestjs/swagger';
import { CreateScheduleBreakDto } from './create-schedule-break.dto';

export class UpdateScheduleBreakDto extends PartialType(
  CreateScheduleBreakDto,
) {}
