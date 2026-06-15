import { NotFoundException } from '@nestjs/common';

export class CompanyNotFoundException extends NotFoundException {
  constructor() {
    super('Company not found');
  }
}
