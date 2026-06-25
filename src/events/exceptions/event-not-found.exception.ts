import { NotFoundException } from '@nestjs/common';
import { EVENT_NOT_FOUND_MESSAGE } from '../constants/events.constants';

export class EventNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(EVENT_NOT_FOUND_MESSAGE(identifier));
  }
}
