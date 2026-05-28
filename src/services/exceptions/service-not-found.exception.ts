import { NotFoundException } from '@nestjs/common';

export class ServiceNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(id ? `El servicio con id ${id} no existe` : 'El servicio no existe');
  }
}
