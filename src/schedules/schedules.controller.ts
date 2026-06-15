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
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Auth, AuthPermissions } from '../auth/decorators';
import { TenantGuard } from '../common/guards/tenant.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiCreateSchedule()
  @AuthPermissions('write:schedules')
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Req() req: AuthenticatedRequest,
  ): string {
    return this.schedulesService.create(
      createScheduleDto,
      req.user.companyId ?? 0,
    );
  }

  @ApiFindAllSchedules()
  @Auth()
  @Get()
  findAll(@Req() req: AuthenticatedRequest): string {
    return this.schedulesService.findAll(req.user.companyId ?? 0);
  }

  @ApiFindOneSchedule()
  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest): string {
    return this.schedulesService.findOne(+id, req.user.companyId ?? 0);
  }

  @Patch(':id')
  @ApiUpdateSchedule()
  @AuthPermissions('write:schedules')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: AuthenticatedRequest,
  ): string {
    return this.schedulesService.update(
      +id,
      updateScheduleDto,
      req.user.companyId ?? 0,
    );
  }

  @Delete(':id')
  @ApiDeleteSchedule()
  @AuthPermissions('write:schedules')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest): string {
    return this.schedulesService.remove(+id, req.user.companyId ?? 0);
  }
}
