import { NotFoundException } from '@nestjs/common';

export class ClientNotFoundException extends NotFoundException {
  constructor(identifier?: string | number) {
    const message = identifier
      ? `Client with identifier ${identifier} not found`
      : 'Client not found';
    super(message);
  }
}
