import { NotFoundException } from '@nestjs/common';

export class AdNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Anuncio con id "${id}" no encontrado.`);
  }
}
