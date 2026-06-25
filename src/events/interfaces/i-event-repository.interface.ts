import { Event, EventStatus } from '../entities/event.entity';
import { CreateEventDto, UpdateEventDto, EventsPaginationDto } from '../dto';

export const EVENT_REPOSITORY = 'EVENT_REPOSITORY';

export interface IEventRepository {
  findPaginated(
    dto: EventsPaginationDto,
    companyId?: number,
    forceStatus?: EventStatus,
  ): Promise<[Event[], number]>;
  findOneById(id: string): Promise<Event | null>;
  findOneBySlug(slug: string): Promise<Event | null>;
  createEvent(
    dto: CreateEventDto,
    autorId: string,
    companyId?: number,
  ): Promise<Event>;
  updateEvent(event: Event, dto: UpdateEventDto): Promise<Event>;
  softDelete(id: string): Promise<void>;
}
