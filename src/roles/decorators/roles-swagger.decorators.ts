import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiFindAllRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los roles con sus permisos asociados',
    }),
  );
}

export function ApiCreateRole() {
  return applyDecorators(ApiOperation({ summary: 'Crear un nuevo rol' }));
}

export function ApiUpdateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un rol y sus permisos' }),
  );
}
