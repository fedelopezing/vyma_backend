import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiGetActiveAds() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener banners activos del carrusel (público)',
      description:
        'Retorna un máximo de 5 anuncios activos para la empresa indicada, ordenados por prioridad. ' +
        'Este endpoint es consumido por el carrusel del portal Astro.',
    }),
    ApiQuery({
      name: 'companyId',
      required: true,
      type: Number,
      description: 'ID de la empresa/tenant cuyos banners se desean obtener',
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de banners activos (máximo 5)',
    }),
    ApiResponse({
      status: 400,
      description: 'Parámetro companyId no proporcionado o inválido',
    }),
  );
}

export function ApiGetAdminAds() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todos los anuncios de la empresa — admin o manager',
      description:
        'Devuelve la lista paginada de todos los anuncios (activos e inactivos) del tenant autenticado.',
    }),
    ApiResponse({ status: 200, description: 'Listado paginado de anuncios' }),
  );
}

export function ApiCreateAd() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo anuncio — admin o manager' }),
    ApiResponse({ status: 201, description: 'Anuncio creado exitosamente' }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o URL de imagen no proporcionada',
    }),
  );
}

export function ApiUpdateAd() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un anuncio existente — admin o manager',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID del anuncio',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    }),
    ApiResponse({
      status: 200,
      description: 'Anuncio actualizado exitosamente',
    }),
    ApiResponse({ status: 404, description: 'Anuncio no encontrado' }),
  );
}

export function ApiDeleteAd() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un anuncio (soft-delete) — admin o manager',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID del anuncio',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    }),
    ApiResponse({ status: 204, description: 'Anuncio eliminado exitosamente' }),
    ApiResponse({ status: 404, description: 'Anuncio no encontrado' }),
  );
}
