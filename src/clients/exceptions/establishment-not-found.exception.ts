import { NotFoundException } from '@nestjs/common';

export class EstablishmentNotFoundException extends NotFoundException {
  constructor(identifier?: string | number) {
    const message = identifier
      ? `Establishment with identifier ${identifier} not found`
      : 'Establishment not found';
    super(message);
  }
}
