import { NotFoundException } from '@nestjs/common';

export class RepresentativeNotFoundException extends NotFoundException {
  constructor(identifier?: string | number) {
    const message = identifier
      ? `Client representative with identifier ${identifier} not found`
      : 'Client representative not found';
    super(message);
  }
}
