import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScheduleBreaksService } from './schedule-breaks.service';
import { CreateScheduleBreakDto } from './dto/create-schedule-break.dto';
import { UpdateScheduleBreakDto } from './dto/update-schedule-break.dto';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiBearerAuth()
@ApiTags('Schedule Breaks')
@Controller('schedule-breaks')
@UseGuards(AuthGuard('jwt'), UserRoleGuard)
export class ScheduleBreaksController {
  constructor(private readonly scheduleBreaksService: ScheduleBreaksService) {}

  @Post()
  @RoleProtected(ValidRoles.admin)
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
  @RoleProtected(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateScheduleBreakDto: UpdateScheduleBreakDto,
  ) {
    return this.scheduleBreaksService.update(+id, updateScheduleBreakDto);
  }

  @Delete(':id')
  @RoleProtected(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.scheduleBreaksService.remove(+id);
  }
}
