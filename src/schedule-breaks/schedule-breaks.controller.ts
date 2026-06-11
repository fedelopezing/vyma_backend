import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateScheduleBreak,
  ApiFindAllScheduleBreaks,
  ApiFindOneScheduleBreak,
  ApiUpdateScheduleBreak,
  ApiDeleteScheduleBreak,
} from './decorators/schedule-breaks-swagger.decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ScheduleBreaksService } from './schedule-breaks.service';
import { CreateScheduleBreakDto } from './dto/create-schedule-break.dto';
import { UpdateScheduleBreakDto } from './dto/update-schedule-break.dto';
import { Auth, AuthRoles } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Schedule Breaks')
@Controller('schedule-breaks')
export class ScheduleBreaksController {
  constructor(private readonly scheduleBreaksService: ScheduleBreaksService) {}

  @Post()
  @ApiCreateScheduleBreak()
  @AuthRoles(ValidRoles.admin)
  create(@Body() createScheduleBreakDto: CreateScheduleBreakDto) {
    return this.scheduleBreaksService.create(createScheduleBreakDto);
  }

  @ApiFindAllScheduleBreaks()
  @Auth()
  @Get()
  findAll() {
    return this.scheduleBreaksService.findAll();
  }

  @ApiFindOneScheduleBreak()
  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleBreaksService.findOne(+id);
  }

  @Patch(':id')
  @ApiUpdateScheduleBreak()
  @AuthRoles(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateScheduleBreakDto: UpdateScheduleBreakDto,
  ) {
    return this.scheduleBreaksService.update(+id, updateScheduleBreakDto);
  }

  @Delete(':id')
  @ApiDeleteScheduleBreak()
  @AuthRoles(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.scheduleBreaksService.remove(+id);
  }
}
