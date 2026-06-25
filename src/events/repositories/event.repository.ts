import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { Event, EventStatus } from '../entities/event.entity';
import { CreateEventDto, UpdateEventDto, EventsPaginationDto } from '../dto';
import { IEventRepository } from '../interfaces/i-event-repository.interface';
import { slugify } from '../../common/helpers/slugify.helper';
import { runInTransaction } from '../../common/helpers/transaction.helper';
import { User } from '../../users/entities/user.entity';

// ─── Helpers de slug acoplados a la entidad Event ────────────────────────────

/**
 * Busca colisiones de slug en la tabla `events` (incluyendo eliminados)
 * y devuelve el slug único con sufijo numérico si es necesario.
 */
async function resolveUniqueEventSlug(
  baseSlug: string,
  qr: QueryRunner,
): Promise<string> {
  const candidates = await qr.manager
    .createQueryBuilder(Event, 'event')
    .where('event.slugEs LIKE :slug OR event.slugEn LIKE :slug', {
      slug: `${baseSlug}%`,
    })
    .withDeleted()
    .getMany();

  if (candidates.length === 0) return baseSlug;

  const pattern = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);
  let max = 0;

  candidates.forEach(({ slugEs, slugEn }) => {
    for (const slug of [slugEs, slugEn]) {
      if (!slug) continue;
      const match = slug.match(pattern);
      if (match) max = Math.max(max, match[1] ? parseInt(match[1], 10) : 1);
    }
  });

  return max === 0 ? baseSlug : `${baseSlug}-${max + 1}`;
}

async function resolveEventSlugs(
  tituloEs: string,
  tituloEn: string | null | undefined,
  qr: QueryRunner,
): Promise<{ slugEs: string; slugEn: string }> {
  const baseEs = slugify(tituloEs);
  const baseEn = tituloEn ? slugify(tituloEn) : `${baseEs}-en`;

  const [slugEs, slugEn] = await Promise.all([
    resolveUniqueEventSlug(baseEs, qr),
    resolveUniqueEventSlug(baseEn, qr),
  ]);

  return { slugEs, slugEn };
}

// ─── Repositorio ──────────────────────────────────────────────────────────────

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    private readonly dataSource: DataSource,
  ) {}

  async findPaginated(
    dto: EventsPaginationDto,
    companyId?: number,
    forceStatus?: EventStatus,
  ): Promise<[Event[], number]> {
    const { page = 1, limit = 10, organizador, estado } = dto;
    const skip = (page - 1) * limit;

    const query = this.repository
      .createQueryBuilder('event')
      .skip(skip)
      .take(limit);

    // Filtro de tenant
    if (companyId !== undefined) {
      query.andWhere('event.companyId = :companyId', { companyId });
    }

    // Filtro de organizador
    if (organizador) {
      query.andWhere('event.organizador = :organizador', { organizador });
    }

    // Filtro temporal y de estado para endpoints públicos
    if (forceStatus === EventStatus.PUBLICADO) {
      query.andWhere('event.fechaEvento >= :now', { now: new Date() });
      query.andWhere('event.estado = :estado', {
        estado: EventStatus.PUBLICADO,
      });
    } else {
      // En admin se permite filtrar por estado manualmente
      const targetStatus = estado;
      if (targetStatus) {
        query.andWhere('event.estado = :estado', { estado: targetStatus });
      }
    }

    // Búsqueda full-text con unaccent
    if (dto.q) {
      query.andWhere(
        '(unaccent(event.tituloEs) ILIKE unaccent(:q) OR ' +
          'unaccent(event.tituloEn) ILIKE unaccent(:q) OR ' +
          'unaccent(event.resumenEs) ILIKE unaccent(:q) OR ' +
          'unaccent(event.resumenEn) ILIKE unaccent(:q))',
        { q: `%${dto.q}%` },
      );
    }

    // Orden: siempre fecha ascendente (el más próximo primero)
    query.orderBy('event.fechaEvento', 'ASC');

    return query.getManyAndCount();
  }

  async findOneById(id: string): Promise<Event | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOneBySlug(slug: string): Promise<Event | null> {
    return this.repository
      .createQueryBuilder('event')
      .where('(event.slugEs = :slug OR event.slugEn = :slug)', { slug })
      .andWhere('event.estado = :estado', { estado: EventStatus.PUBLICADO })
      .andWhere('event.fechaEvento >= :now', { now: new Date() })
      .getOne();
  }

  async createEvent(
    dto: CreateEventDto,
    autorId: string,
    companyId?: number,
  ): Promise<Event> {
    return runInTransaction(this.dataSource, async (qr) => {
      const slugs = await resolveEventSlugs(dto.tituloEs, dto.tituloEn, qr);

      const event = this.repository.create({
        ...dto,
        ...slugs,
        fechaEvento: new Date(dto.fechaEvento),
        autor: { id: parseInt(autorId, 10) } as User,
        ...(companyId !== undefined && { companyId }),
      });

      return qr.manager.save(event);
    });
  }

  async updateEvent(event: Event, dto: UpdateEventDto): Promise<Event> {
    return runInTransaction(this.dataSource, async (qr) => {
      // El slug solo se recalcula si el evento está en BORRADOR
      if (event.estado === EventStatus.BORRADOR) {
        const tituloEsChanged = dto.tituloEs && dto.tituloEs !== event.tituloEs;
        const tituloEnChanged = dto.tituloEn && dto.tituloEn !== event.tituloEn;

        if (tituloEsChanged) {
          event.slugEs = await resolveUniqueEventSlug(
            slugify(dto.tituloEs!),
            qr,
          );
        }
        if (tituloEnChanged) {
          event.slugEn = await resolveUniqueEventSlug(
            slugify(dto.tituloEn!),
            qr,
          );
        }
      }

      // Actualizar fechaEvento si se provee
      if (dto.fechaEvento) {
        event.fechaEvento = new Date(dto.fechaEvento);
      }

      Object.assign(event, {
        ...dto,
        ...(dto.fechaEvento && { fechaEvento: new Date(dto.fechaEvento) }),
      });

      return qr.manager.save(event);
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
