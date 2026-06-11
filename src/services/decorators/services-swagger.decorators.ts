import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiCreateService() {
  return applyDecorators(ApiOperation({ summary: 'Crear un servicio' }));
}

export function ApiFindAllServices() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los servicios' }),
  );
}

export function ApiFindOneService() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un servicio por ID' }),
  );
}

export function ApiUpdateService() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un servicio por ID' }),
  );
}

export function ApiDeleteService() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un servicio por ID' }),
  );
}
