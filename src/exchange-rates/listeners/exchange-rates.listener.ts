import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../email/email.service';

@Injectable()
export class ExchangeRatesListener {
  private readonly logger = new Logger(ExchangeRatesListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent('rates.scraping_failed')
  async handleScrapingFailedEvent(payload: { error: string; timestamp: Date }) {
    this.logger.log(
      `Handling rates.scraping_failed event. Error: ${payload.error}`,
    );
    try {
      const subject = 'Alerta: Fallo en scraping de cotizaciones';
      const message = `El scraping de cotizaciones ha fallado a las ${new Date(payload.timestamp).toLocaleString()}.<br/>Detalle del error: <strong>${payload.error}</strong>`;
      await this.emailService.sendSystemAlert(subject, message);
    } catch (error) {
      this.logger.error('Failed to send system alert email', error);
    }
  }
}
