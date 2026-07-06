import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventOrganizer } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { IEventRepository } from './interfaces/i-event-repository.interface';
import { EventNotFoundException } from './exceptions/event-not-found.exception';
import { Event } from './entities/event.entity';

/**
 * Lanza BadRequestException si faltan los campos bilingües requeridos
 * para publicar un evento (tituloEn, resumenEn, contenidoEn).
 */
export function assertBilingualComplete(dto: {
  tituloEn?: string | null;
  resumenEn?: string | null;
  contenidoEn?: string | null;
}): void {
  const missing = !dto.tituloEn || !dto.resumenEn || !dto.contenidoEn;
  if (missing) {
    throw new BadRequestException(
      'Para publicar, los campos en inglés ' +
        '(tituloEn, resumenEn, contenidoEn) son obligatorios.',
    );
  }
}

/**
 * Lanza BadRequestException si el organizador es SOCIO y no se provee
 * el nombre del socio organizador.
 */
export function assertOrganizadorNombre(dto: Partial<CreateEventDto>): void {
  if (dto.organizador === EventOrganizer.SOCIO && !dto.organizadorNombre) {
    throw new BadRequestException(
      'El campo organizadorNombre es obligatorio cuando el organizador es SOCIO.',
    );
  }
}

/**
 * Lanza EventNotFoundException si el evento no existe.
 * Lanza ForbiddenException si el usuario no tiene acceso al tenant del evento.
 */
export async function findEventOrFail(
  id: string,
  eventRepository: IEventRepository,
  user?: { companyId?: number; isSuperAdmin?: boolean },
): Promise<Event> {
  const event = await eventRepository.findOneById(id);
  if (!event) {
    throw new EventNotFoundException(id);
  }
  if (
    user &&
    !user.isSuperAdmin &&
    Number(event.companyId) !== Number(user.companyId)
  ) {
    throw new ForbiddenException(
      'No tienes los permisos necesarios para realizar esta acción.',
    );
  }
  return event;
}

/**
 * Centraliza la captura y loggeo de errores inesperados.
 */
export function handleUnexpectedError(
  error: unknown,
  logger: Logger,
  logMessage: string,
  userMessage: string,
  context?: Record<string, unknown>,
): never {
  if (error instanceof HttpException) throw error;
  logger.error(
    logMessage,
    error instanceof Error ? error.stack : undefined,
    context,
  );
  throw new InternalServerErrorException(userMessage);
}
