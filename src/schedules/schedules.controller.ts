import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateSchedule,
  ApiFindAllSchedules,
  ApiFindOneSchedule,
  ApiUpdateSchedule,
  ApiDeleteSchedule,
} from './decorators/schedules-swagger.decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Delete,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Auth, AuthRoles } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiCreateSchedule()
  @AuthRoles(ValidRoles.admin)
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @ApiFindAllSchedules()
  @Auth()
  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @ApiFindOneSchedule()
  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(':id')
  @ApiUpdateSchedule()
  @AuthRoles(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiDeleteSchedule()
  @AuthRoles(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
}
