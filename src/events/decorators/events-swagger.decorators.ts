import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EventResponseDto } from '../dto/event-response.dto';

export function ApiFindAllAdminEvents() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Listar todos los eventos (borradores y publicados, sin filtro temporal) — admin',
    }),
    ApiResponse({
      status: 200,
      description: 'Listado completo de eventos',
      type: EventResponseDto,
      isArray: true,
    }),
    ApiResponse({ status: 401, description: 'No autenticado' }),
    ApiResponse({ status: 403, description: 'Sin permisos suficientes' }),
  );
}

export function ApiCreateEvent() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo evento — admin' }),
    ApiResponse({
      status: 201,
      description: 'Evento creado exitosamente',
      type: EventResponseDto,
    }),
    ApiResponse({
      status: 400,
      description:
        'Datos inválidos (bilingüismo al publicar, organizadorNombre si SOCIO)',
    }),
    ApiResponse({ status: 401, description: 'No autenticado' }),
    ApiResponse({ status: 403, description: 'Sin permisos suficientes' }),
  );
}

export function ApiUpdateEvent() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un evento — admin' }),
    ApiParam({
      name: 'id',
      description: 'UUID del evento',
      example: 'uuid-aqui',
    }),
    ApiResponse({
      status: 200,
      description: 'Evento actualizado exitosamente',
      type: EventResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos o incompletos' }),
    ApiResponse({ status: 401, description: 'No autenticado' }),
    ApiResponse({
      status: 403,
      description: 'Sin permisos o tenant incorrecto',
    }),
    ApiResponse({ status: 404, description: 'Evento no encontrado' }),
  );
}

export function ApiDeleteEvent() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un evento (soft-delete) — admin' }),
    ApiParam({
      name: 'id',
      description: 'UUID del evento',
      example: 'uuid-aqui',
    }),
    ApiResponse({ status: 204, description: 'Evento eliminado exitosamente' }),
    ApiResponse({ status: 401, description: 'No autenticado' }),
    ApiResponse({
      status: 403,
      description: 'Sin permisos o tenant incorrecto',
    }),
    ApiResponse({ status: 404, description: 'Evento no encontrado' }),
  );
}

export function ApiFindAllEvents() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Listar eventos futuros publicados (paginado, ordenados por fecha ascendente)',
    }),
    ApiResponse({
      status: 200,
      description: 'Listado paginado de eventos futuros publicados',
      type: EventResponseDto,
      isArray: true,
    }),
  );
}

export function ApiFindOneEventBySlug() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un evento publicado por su slug' }),
    ApiParam({
      name: 'slug',
      description: 'Slug del evento en español o inglés',
      example: 'cena-networking-ccps-2025',
    }),
    ApiResponse({
      status: 200,
      description: 'Evento encontrado',
      type: EventResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Evento no encontrado, no publicado o ya ocurrido',
    }),
  );
}
