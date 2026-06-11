import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiCreateProfession() {
  return applyDecorators(ApiOperation({ summary: 'Crear una profesión' }));
}

export function ApiFindAllProfessions() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todas las profesiones' }),
  );
}

export function ApiFindOneProfession() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una profesión por ID' }),
  );
}

export function ApiUpdateProfession() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar una profesión por ID' }),
  );
}

export function ApiDeleteProfession() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar una profesión por ID' }),
  );
}
