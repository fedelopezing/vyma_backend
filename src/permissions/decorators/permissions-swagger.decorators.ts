import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiFindAllPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los permisos disponibles' }),
  );
}
