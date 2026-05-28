import { NotFoundException } from '@nestjs/common';

export class PermissionNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(id ? `El permiso con id ${id} no existe` : 'El permiso no existe');
  }
}
