import { NotFoundException } from '@nestjs/common';

export class RoleNotFoundException extends NotFoundException {
  constructor(roleId: number) {
    super(roleId ? `El rol con id ${roleId} no existe` : 'El rol no existe');
  }
}
