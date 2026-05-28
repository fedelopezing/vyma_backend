import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(
      userId ? `El usuario con id ${userId} no existe` : 'El usuario no existe',
    );
  }
}
