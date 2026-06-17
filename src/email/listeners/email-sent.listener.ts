import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CreateEmailDto } from '../dto/create-email.dto';
import { WhatsappMessagingService } from '../../whatsapp/whatsapp-messaging.service';

@Injectable()
export class EmailSentListener {
  private readonly logger = new Logger(EmailSentListener.name);

  constructor(
    private readonly whatsappMessagingService: WhatsappMessagingService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('email.sent', { async: true })
  async handleEmailSentEvent(data: CreateEmailDto) {
    try {
      const phoneNumber =
        this.configService.get<string>('WHATSAPP_TO') || '+595981789843';
      const message = `*Asunto:* Esta persona ha solicitado un presupuesto
    *Nombre:* ${data.name}
    *Email:* ${data.email}
    *Numero:* ${data.phone}
    *Ciudad:* ${data.city}
    *Dirección:* ${data.address}
    *Detalle:* ${data.details}`;

      await this.whatsappMessagingService.sendMessage(phoneNumber, message);
    } catch (error) {
      this.logger.error(
        'Error in EmailSentListener sending WhatsApp message',
        error,
      );
    }
  }
}
