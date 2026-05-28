import { NotFoundException } from '@nestjs/common';

export class ProfessionNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(
      id ? `La profesión con id ${id} no existe` : 'La profesión no existe',
    );
  }
}
