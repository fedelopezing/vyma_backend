import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MemberApplicationReceivedEvent,
  MemberApplicationStatusChangedEvent,
} from '../events/member-application.event';

@Injectable()
export class MemberNotificationsListener {
  private readonly logger = new Logger(MemberNotificationsListener.name);

  @OnEvent('member.application.received')
  async handleMemberApplicationReceived(event: MemberApplicationReceivedEvent) {
    try {
      this.logger.log(
        `Handling member.application.received for member ${event.member.id}`,
      );
      // Here you would integrate with your email service (e.g., Resend)
      // to notify the admin team or send a confirmation to the applicant.
    } catch (error) {
      this.logger.error(
        `Failed to send member.application.received notification: ${error.message}`,
        error.stack,
      );
      // Admin fallback alert would go here
    }
  }

  @OnEvent('member.application.status-changed')
  async handleMemberApplicationStatusChanged(
    event: MemberApplicationStatusChangedEvent,
  ) {
    try {
      this.logger.log(
        `Handling member.application.status-changed for member ${event.member.id} to status ${event.newStatus}`,
      );
      // Integrate with email service to notify the applicant of their approval/rejection.
    } catch (error) {
      this.logger.error(
        `Failed to send member.application.status-changed notification: ${error.message}`,
        error.stack,
      );
      // Admin fallback alert would go here
    }
  }
}
