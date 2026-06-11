import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiCreateScheduleBreak() {
  return applyDecorators(ApiOperation({ summary: 'Crear un receso' }));
}

export function ApiFindAllScheduleBreaks() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los recesos' }),
  );
}

export function ApiFindOneScheduleBreak() {
  return applyDecorators(ApiOperation({ summary: 'Obtener un receso por ID' }));
}

export function ApiUpdateScheduleBreak() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un receso por ID' }),
  );
}

export function ApiDeleteScheduleBreak() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un receso por ID' }),
  );
}
