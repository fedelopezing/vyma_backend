import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiFindAllAdminNews() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Listar todas las noticias (borradores y publicadas) — admin o ccps',
    }),
    ApiResponse({ status: 200, description: 'Listado completo de noticias' }),
  );
}

export function ApiCreateNews() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear una nueva noticia — admin o ccps' }),
    ApiResponse({ status: 201, description: 'Noticia creada exitosamente' }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o incompletos (bilingüismo al publicar)',
    }),
  );
}

export function ApiUpdateNews() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar una noticia — admin o ccps' }),
    ApiParam({
      name: 'id',
      description: 'UUID de la noticia',
      example: 'uuid-aqui',
    }),
    ApiResponse({
      status: 200,
      description: 'Noticia actualizada exitosamente',
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos o incompletos' }),
    ApiResponse({ status: 404, description: 'Noticia no encontrada' }),
  );
}

export function ApiDeleteNews() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una noticia (soft-delete) — admin o ccps',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID de la noticia',
      example: 'uuid-aqui',
    }),
    ApiResponse({ status: 204, description: 'Noticia eliminada exitosamente' }),
    ApiResponse({ status: 404, description: 'Noticia no encontrada' }),
  );
}

export function ApiFindAllNews() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar noticias publicadas (paginado)' }),
    ApiResponse({
      status: 200,
      description: 'Listado paginado de noticias publicadas',
    }),
  );
}

export function ApiFindOneNewsBySlug() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una noticia publicada por su slug' }),
    ApiParam({
      name: 'slug',
      description: 'Slug de la noticia en español o inglés',
      example: 'apertura-nuevo-centro-salud',
    }),
    ApiResponse({ status: 200, description: 'Noticia encontrada' }),
    ApiResponse({
      status: 404,
      description: 'Noticia no encontrada o no publicada',
    }),
  );
}
