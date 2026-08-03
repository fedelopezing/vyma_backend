import { NotFoundException } from '@nestjs/common';

export class StaffMemberNotFoundException extends NotFoundException {
  constructor(idOrCi: string | number) {
    super(`Staff Member with identifier "${idOrCi}" was not found`);
  }
}
