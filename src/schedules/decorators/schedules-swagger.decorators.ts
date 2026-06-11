import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiCreateSchedule() {
  return applyDecorators(ApiOperation({ summary: 'Crear un horario' }));
}

export function ApiFindAllSchedules() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los horarios' }),
  );
}

export function ApiFindOneSchedule() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un horario por ID' }),
  );
}

export function ApiUpdateSchedule() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un horario por ID' }),
  );
}

export function ApiDeleteSchedule() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un horario por ID' }),
  );
}
