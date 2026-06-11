import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiCreateProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un perfil (solo admin)' }),
  );
}

export function ApiFindAllProfiles() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los perfiles (solo admin)' }),
  );
}

export function ApiFindOneProfile() {
  return applyDecorators(ApiOperation({ summary: 'Obtener un perfil por ID' }));
}

export function ApiUpdateProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un perfil por ID' }),
  );
}

export function ApiDeleteProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un perfil por ID' }),
  );
}
