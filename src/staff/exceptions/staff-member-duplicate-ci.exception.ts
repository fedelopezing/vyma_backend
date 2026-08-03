import { ConflictException } from '@nestjs/common';

export class StaffMemberDuplicateCiException extends ConflictException {
  constructor(nationalId: string) {
    super(
      `A staff member with Cédula de Identidad (nationalId) "${nationalId}" already exists in this company.`,
    );
  }
}
