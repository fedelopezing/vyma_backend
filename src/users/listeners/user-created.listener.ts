import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../email/email.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: {
    user: User;
    activationToken: string;
  }) {
    this.logger.log(`Sending activation email to ${payload.user.email}`);
    try {
      await this.emailService.sendActivationEmail(
        payload.user.email,
        payload.user.name,
        payload.activationToken,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send activation email to ${payload.user.email}`,
        error,
      );
    }
  }
}
