import { NotFoundException } from '@nestjs/common';

export class MemberNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Member with id "${id}" was not found`);
  }
}
