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
import { Auth, AuthRoles } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
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
  @AuthRoles(ValidRoles.admin)
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
  @AuthRoles(ValidRoles.admin)
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
  @AuthRoles(ValidRoles.admin)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest): string {
    return this.schedulesService.remove(+id, req.user.companyId ?? 0);
  }
}
