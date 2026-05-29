import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { NewsPublishedEvent } from '../events/news-published.event';

@Injectable()
export class AstroWebhookListener {
  private readonly logger = new Logger(AstroWebhookListener.name);

  constructor(private readonly configService: ConfigService) {}

  @OnEvent('news.published', { async: true })
  async handleNewsPublishedEvent(event: NewsPublishedEvent): Promise<void> {
    try {
      const webhookUrl = this.configService.get<string>('ASTRO_WEBHOOK_URL');
      const webhookSecret = this.configService.get<string>(
        'ASTRO_WEBHOOK_SECRET',
      );

      if (!webhookUrl) {
        this.logger.warn(
          'ASTRO_WEBHOOK_URL no está configurado. Se omitirá la llamada al webhook.',
        );
        return;
      }

      this.logger.log(
        `Activando webhook para los slugs: ES[${event.slugEs}] EN[${event.slugEn || 'N/A'}]`,
      );

      const payload = {
        slugEs: event.slugEs,
        slugEn: event.slugEn,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookSecret && { Authorization: `Bearer ${webhookSecret}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(
          `Astro webhook falló con el status: ${response.status}`,
        );
      } else {
        this.logger.log('Astro webhook llamado exitosamente.');
      }
    } catch (error) {
      // Regla de arquitectura: los errores en listeners deben ser capturados y loggeados sin relanzar
      this.logger.error(
        'Error de red o timeout al intentar conectar con el Astro Webhook',
        error.stack,
      );
    }
  }
}
