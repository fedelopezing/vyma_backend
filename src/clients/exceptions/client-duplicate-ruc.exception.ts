import { ConflictException } from '@nestjs/common';

export class ClientDuplicateRucException extends ConflictException {
  constructor(ruc: string) {
    super(`Client with RUC ${ruc} already exists for this company`);
  }
}
