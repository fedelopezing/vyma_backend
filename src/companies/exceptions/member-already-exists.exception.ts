import { ConflictException } from '@nestjs/common';

export class MemberAlreadyExistsException extends ConflictException {
  constructor() {
    super('User is already a member of this company');
  }
}
