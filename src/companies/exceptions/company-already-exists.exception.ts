import { ConflictException } from '@nestjs/common';

export class CompanyAlreadyExistsException extends ConflictException {
  constructor() {
    super('A company with this unique attribute already exists');
  }
}
