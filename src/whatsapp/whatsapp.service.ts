import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);

  private client: Client;
  private isReady = false;

  // Evita inicializaciones múltiples
  private initializing = false;

  // Reintentos
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.buildClient();
    await this.initializeClient();
  }

  async onModuleDestroy() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    try {
      if (this.client) {
        await this.client.destroy();
      }
    } catch (e) {
      this.logger.warn(`Error destroying WhatsApp client: ${String(e)}`);
    }
  }

  private async buildClient() {
    const stage = this.configService.get<string>('STAGE', 'dev');

    const puppeteerConfig =
      stage === 'dev'
        ? {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          }
        : {
            // En Linux/Docker suele ser mejor parametrizar la ruta
            executablePath:
              this.configService.get<string>('CHROME_EXECUTABLE_PATH') ??
              '/usr/bin/chromium-browser',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          };

    // IMPORTANTE: clientId único por servicio/instancia
    const clientId =
      this.configService.get<string>('WHATSAPP_CLIENT_ID') ?? 'biolimpieza';

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId }),
      puppeteer: puppeteerConfig,
    });

    // Eventos
    this.client.once('ready', () => {
      this.logger.log('Client is ready!');
      this.isReady = true;
      this.reconnectAttempts = 0; // resetea backoff
    });

    this.client.on('qr', (qr) => {
      this.isReady = false;
      this.logger.log('QR RECEIVED NEW SESSION');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', () => {
      this.logger.log('Client authenticated successfully');
    });

    this.client.on('auth_failure', (message) => {
      this.logger.error(`Authentication failed: ${message}`);
      this.isReady = false;
      // auth failure suele requerir re-scan. Igual intentamos reiniciar.
      this.scheduleReconnect('auth_failure');
    });

    this.client.on('disconnected', async (reason) => {
      this.logger.warn(`Client disconnected: ${reason}`);
      this.isReady = false;

      // Mata el browser actual para evitar estado zombie
      try {
        await this.client.destroy();
      } catch (e) {
        this.logger.warn(`Error on destroy after disconnect: ${String(e)}`);
      }

      this.scheduleReconnect(`disconnected:${reason}`);
    });

    // Para que no te exploten "unhandledRejection" silenciosas
    process.on('unhandledRejection', (reason) => {
      this.logger.error(`UnhandledRejection: ${String(reason)}`);
    });
  }

  private async initializeClient() {
    if (this.initializing) return;
    this.initializing = true;

    try {
      this.logger.log('Initializing WhatsApp client...');
      await this.client.initialize();
    } catch (e) {
      this.logger.error(`Error initializing client: ${String(e)}`);
      this.isReady = false;
      this.scheduleReconnect('initialize_error');
    } finally {
      this.initializing = false;
    }
  }

  private scheduleReconnect(from: string) {
    if (this.reconnectTimer) return; // ya hay uno programado

    // backoff simple: 3s, 6s, 12s, 24s... máx 60s
    this.reconnectAttempts += 1;
    const delay = Math.min(
      3000 * Math.pow(2, this.reconnectAttempts - 1),
      60000,
    );

    this.logger.warn(
      `Scheduling reconnect (${from}) in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;

      // OJO: si destroy() dejó al client en mal estado, recreamos
      try {
        await this.buildClient();
      } catch (e) {
        this.logger.error(`Error rebuilding client: ${String(e)}`);
      }

      await this.initializeClient();
    }, delay);
  }

  private ensureReady() {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready yet');
    }
  }

  getClientStatus(): { isReady: boolean } {
    return { isReady: this.isReady };
  }

  async sendMessage(phoneNumber: string, message: string) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet');
    }

    try {
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const chatId = `${formattedNumber}@c.us`;

      await this.client.sendMessage(chatId, message);
      this.logger.log(`Message sent to ${phoneNumber}`);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw error;
    }
  }

  async getChats() {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet');
    }

    const chats = await this.client.getChats();
    return chats;
  }

  getClient(): Client {
    return this.client;
  }
}
