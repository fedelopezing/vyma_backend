import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para establecer los permisos requeridos en un endpoint o controlador.
 * @param permissions Lista de acciones (e.g., 'create:news', 'read:users')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
