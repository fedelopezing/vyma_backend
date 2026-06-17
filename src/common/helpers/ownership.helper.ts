import { ForbiddenException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { ValidRoles } from '../../auth/interfaces/valid-roles';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

/**
 * Verifica si el usuario actual es el propietario de un recurso o si tiene
 * privilegios de administrador (admin o superAdmin).
 * Si no cumple ninguna de las dos condiciones, lanza un ForbiddenException.
 *
 * @param currentUser El usuario autenticado que realiza la petición.
 * @param resourceOwnerId El ID del usuario que es dueño del recurso.
 */
export function checkOwnershipOrAdmin(
  currentUser: User | JwtPayload,
  resourceOwnerId: number,
): void {
  const currentUserId = 'sub' in currentUser ? currentUser.sub : currentUser.id;
  const roleName =
    'sub' in currentUser ? currentUser.role : currentUser.role?.name;

  const isOwner = resourceOwnerId === currentUserId;
  const hasAdminPrivileges = [ValidRoles.admin].includes(
    roleName as ValidRoles,
  );

  if (!isOwner && !hasAdminPrivileges) {
    throw new ForbiddenException(
      'No tienes permisos para modificar este recurso',
    );
  }
}
