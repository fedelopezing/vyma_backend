import { Inject, Injectable, Logger } from '@nestjs/common';

import { Event, EventStatus } from './entities/event.entity';
import {
  IEventRepository,
  EVENT_REPOSITORY,
} from './interfaces/i-event-repository.interface';
import { CreateEventDto, UpdateEventDto, EventsPaginationDto } from './dto';
import { buildPaginatedResponse } from '../common/helpers';
import { PaginatedResponse } from '../common/interfaces';
import { EventNotFoundException } from './exceptions/event-not-found.exception';
import {
  assertBilingualComplete,
  assertOrganizadorNombre,
  findEventOrFail,
  handleUnexpectedError,
} from './events.utils';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  // ─── CRUD Admin ─────────────────────────────────────────────────────────────

  async create(
    dto: CreateEventDto,
    autorId: string,
    companyId?: number,
  ): Promise<Event> {
    if (dto.estado === EventStatus.PUBLICADO) {
      assertBilingualComplete(dto);
    }
    assertOrganizadorNombre(dto);

    try {
      this.logger.log('Creating new event', {
        tituloEs: dto.tituloEs,
        autorId,
      });
      const event = await this.eventRepository.createEvent(
        dto,
        autorId,
        companyId,
      );
      this.logger.log('Event created successfully', { id: event.id });
      return event;
    } catch (error) {
      handleUnexpectedError(
        error,
        this.logger,
        'Error creating event',
        'Error al crear el evento en la base de datos.',
        { dto, autorId },
      );
    }
  }

  async findAllAdmin(
    paginationDto: EventsPaginationDto,
    companyId?: number,
  ): Promise<PaginatedResponse<Event>> {
    try {
      const [data, total] = await this.eventRepository.findPaginated(
        paginationDto,
        companyId,
      );
      return buildPaginatedResponse(
        data,
        total,
        paginationDto.page,
        paginationDto.limit,
      );
    } catch (error) {
      handleUnexpectedError(
        error,
        this.logger,
        'Error fetching admin events',
        'Error al obtener la lista de eventos.',
        { paginationDto, companyId },
      );
    }
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    user?: { companyId?: number; isSuperAdmin?: boolean },
  ): Promise<Event> {
    try {
      const event = await findEventOrFail(id, this.eventRepository, user);

      const wasPublished = event.estado === EventStatus.PUBLICADO;
      const isPublishingNow = dto.estado === EventStatus.PUBLICADO;
      const remainsPublished =
        wasPublished && dto.estado !== EventStatus.BORRADOR;

      if (isPublishingNow || remainsPublished) {
        assertBilingualComplete({ ...event, ...dto });
      }

      const mergedOrganizador = dto.organizador ?? event.organizador;
      const mergedNombre = dto.organizadorNombre ?? event.organizadorNombre;
      assertOrganizadorNombre({
        organizador: mergedOrganizador,
        organizadorNombre: mergedNombre ?? undefined,
      });

      this.logger.log('Updating event', { id, dto });
      const updatedEvent = await this.eventRepository.updateEvent(event, dto);
      this.logger.log('Event updated successfully', { id });
      return updatedEvent;
    } catch (error) {
      handleUnexpectedError(
        error,
        this.logger,
        'Error updating event',
        'Error al actualizar el evento.',
        { id, dto },
      );
    }
  }

  async remove(
    id: string,
    user?: { companyId?: number; isSuperAdmin?: boolean },
  ): Promise<void> {
    try {
      await findEventOrFail(id, this.eventRepository, user);
      this.logger.log('Soft deleting event', { id });
      await this.eventRepository.softDelete(id);
      this.logger.log('Event soft deleted successfully', { id });
    } catch (error) {
      handleUnexpectedError(
        error,
        this.logger,
        'Error removing event',
        'Error al eliminar el evento.',
        { id },
      );
    }
  }

  // ─── CRUD público ─────────────────────────────────────────────────────────────

  async findAll(
    paginationDto: EventsPaginationDto,
  ): Promise<PaginatedResponse<Event>> {
    try {
      const [data, total] = await this.eventRepository.findPaginated(
        paginationDto,
        paginationDto.companyId,
        EventStatus.PUBLICADO,
      );
      return buildPaginatedResponse(
        data,
        total,
        paginationDto.page,
        paginationDto.limit,
      );
    } catch (error) {
      handleUnexpectedError(
        error,
        this.logger,
        'Error fetching public events',
        'Error al obtener la lista pública de eventos.',
        { paginationDto },
      );
    }
  }

  async findOneBySlug(slug: string): Promise<Event> {
    try {
      const event = await this.eventRepository.findOneBySlug(slug);

      if (!event) {
        throw new EventNotFoundException(slug);
      }

      return event;
    } catch (error) {
      handleUnexpectedError(
        error,
        this.logger,
        'Error finding event by slug',
        'Error al buscar el evento.',
        { slug },
      );
    }
  }
}
