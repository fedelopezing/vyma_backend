import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';

import {
  ApiFindAllAdminEvents,
  ApiCreateEvent,
  ApiUpdateEvent,
  ApiDeleteEvent,
  ApiFindAllEvents,
  ApiFindOneEventBySlug,
} from './decorators/events-swagger.decorators';

import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventsPaginationDto,
  EventResponseDto,
} from './dto';
import { PaginatedResponse } from '../common/interfaces';
import { AuthPermissions } from '../auth/decorators';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { CompanyModule } from '../common/constants/modules.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Public, ActiveCompanyId } from '../common/decorators';
import { CompaniesRepository } from '../companies/repositories/companies.repository';
import { resolveActiveCompany } from '../common/helpers/company-resolver.helper';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  companyId?: number;
}

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  // ─── Endpoints administrativos (tenant-scoped) ────────────────────────────

  @Get('admin')
  @AuthPermissions('read:events')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.EVENTS)
  @ApiFindAllAdminEvents()
  async findAllAdmin(
    @Query() paginationDto: EventsPaginationDto,
    @ActiveCompanyId() companyId: number,
  ): Promise<PaginatedResponse<EventResponseDto>> {
    const paginated = await this.eventsService.findAllAdmin(
      paginationDto,
      companyId,
    );
    return {
      ...paginated,
      data: this.toResponse(paginated.data),
    };
  }

  @Post('admin')
  @AuthPermissions('create:events')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.EVENTS)
  @ApiCreateEvent()
  async create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(
      createEventDto,
      String(req.user.sub),
      req.companyId,
    );
    return this.toResponse(event);
  }

  @Put('admin/:id')
  @AuthPermissions('update:events')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.EVENTS)
  @ApiUpdateEvent()
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.update(id, updateEventDto, {
      companyId: req.companyId,
      isSuperAdmin: req.user.isSuperAdmin,
    });
    return this.toResponse(event);
  }

  @Delete('admin/:id')
  @AuthPermissions('delete:events')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.EVENTS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteEvent()
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.eventsService.remove(id, {
      companyId: req.companyId,
      isSuperAdmin: req.user.isSuperAdmin,
    });
  }

  // ─── Endpoints públicos (sin filtro de tenant) ─────────────────────────────

  @Get()
  @Public()
  @ApiFindAllEvents()
  async findAll(
    @Query() paginationDto: EventsPaginationDto,
  ): Promise<PaginatedResponse<EventResponseDto>> {
    const company = await resolveActiveCompany(
      paginationDto.companyUuid,
      this.companiesRepository,
    );
    paginationDto.companyId = company.id;
    const paginated = await this.eventsService.findAll(paginationDto);
    return {
      ...paginated,
      data: this.toResponse(paginated.data),
    };
  }

  @Get(':slug')
  @Public()
  @ApiFindOneEventBySlug()
  async findOneBySlug(@Param('slug') slug: string): Promise<EventResponseDto> {
    const event = await this.eventsService.findOneBySlug(slug);
    return this.toResponse(event);
  }

  private toResponse(data: Event): EventResponseDto;
  private toResponse(data: Event[]): EventResponseDto[];
  private toResponse(
    data: Event | Event[],
  ): EventResponseDto | EventResponseDto[] {
    return plainToInstance(EventResponseDto, data, {
      excludeExtraneousValues: true,
    }) as EventResponseDto | EventResponseDto[];
  }
}
