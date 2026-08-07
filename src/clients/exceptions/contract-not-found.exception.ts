import { NotFoundException } from '@nestjs/common';

export class ContractNotFoundException extends NotFoundException {
  constructor(identifier?: string | number) {
    const message = identifier
      ? `Contract with identifier ${identifier} not found`
      : 'Contract not found';
    super(message);
  }
}
