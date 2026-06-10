import { ForbiddenException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { ValidRoles } from '../../auth/interfaces/valid-roles';

/**
 * Verifica si el usuario actual es el propietario de un recurso o si tiene
 * privilegios de administrador (admin o superAdmin).
 * Si no cumple ninguna de las dos condiciones, lanza un ForbiddenException.
 *
 * @param currentUser El usuario autenticado que realiza la petición.
 * @param resourceOwnerId El ID del usuario que es dueño del recurso.
 */
export function checkOwnershipOrAdmin(
  currentUser: User,
  resourceOwnerId: number,
): void {
  const isOwner = resourceOwnerId === currentUser.id;
  const hasAdminPrivileges = [ValidRoles.admin].includes(
    currentUser.role?.name as ValidRoles,
  );

  if (!isOwner && !hasAdminPrivileges) {
    throw new ForbiddenException(
      'No tienes permisos para modificar este recurso',
    );
  }
}
