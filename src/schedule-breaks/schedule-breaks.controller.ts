import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScheduleBreaksService } from './schedule-breaks.service';
import { CreateScheduleBreakDto } from './dto/create-schedule-break.dto';
import { UpdateScheduleBreakDto } from './dto/update-schedule-break.dto';

@Controller('schedule-breaks')
export class ScheduleBreaksController {
  constructor(private readonly scheduleBreaksService: ScheduleBreaksService) {}

  @Post()
  create(@Body() createScheduleBreakDto: CreateScheduleBreakDto) {
    return this.scheduleBreaksService.create(createScheduleBreakDto);
  }

  @Get()
  findAll() {
    return this.scheduleBreaksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleBreaksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleBreakDto: UpdateScheduleBreakDto) {
    return this.scheduleBreaksService.update(+id, updateScheduleBreakDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleBreaksService.remove(+id);
  }
}
