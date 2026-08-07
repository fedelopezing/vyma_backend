import { PayloadTooLargeException } from '@nestjs/common';

export class FileTooLargeException extends PayloadTooLargeException {
  constructor(maxSizeMb: number) {
    super(`File is too large. Maximum size allowed is ${maxSizeMb}MB`);
  }
}
