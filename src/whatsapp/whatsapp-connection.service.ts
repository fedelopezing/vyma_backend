import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappConnectionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(WhatsappConnectionService.name);

  private client: Client;
  private ready = false;
  private initializing = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const isEnabled =
      this.configService.get<string>('WHATSAPP_ENABLED') === 'true';

    if (!isEnabled) {
      this.logger.log(
        'WhatsApp connection is disabled (WHATSAPP_ENABLED is not set to true)',
      );
      return;
    }

    // Temporarily disabled per user request
    // await this.buildClient();
    // await this.initializeClient();
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

  private async buildClient(): Promise<void> {
    const stage = this.configService.get<string>('STAGE', 'dev');

    const puppeteerConfig =
      stage === 'dev'
        ? {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          }
        : {
            executablePath:
              this.configService.get<string>('CHROME_EXECUTABLE_PATH') ??
              '/usr/bin/chromium-browser',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          };

    const clientId =
      this.configService.get<string>('WHATSAPP_CLIENT_ID') ?? 'biolimpieza';

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId }),
      puppeteer: puppeteerConfig,
    });

    this.client.once('ready', () => {
      this.logger.log('Client is ready!');
      this.ready = true;
      this.reconnectAttempts = 0;
    });

    this.client.on('qr', (qr) => {
      this.ready = false;
      this.logger.log('QR RECEIVED NEW SESSION');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', () => {
      this.logger.log('Client authenticated successfully');
    });

    this.client.on('auth_failure', (message) => {
      this.logger.error(`Authentication failed: ${message}`);
      this.ready = false;
      this.scheduleReconnect('auth_failure');
    });

    this.client.on('disconnected', async (reason) => {
      this.logger.warn(`Client disconnected: ${reason}`);
      this.ready = false;
      try {
        await this.client.destroy();
      } catch (e) {
        this.logger.warn(`Error on destroy after disconnect: ${String(e)}`);
      }
      this.scheduleReconnect(`disconnected:${reason}`);
    });

    process.on('unhandledRejection', (reason) => {
      this.logger.error(`UnhandledRejection: ${String(reason)}`);
    });
  }

  private async initializeClient(): Promise<void> {
    if (this.initializing) return;
    this.initializing = true;

    try {
      this.logger.log('Initializing WhatsApp client...');
      await this.client.initialize();
    } catch (e) {
      this.logger.error(`Error initializing client: ${String(e)}`);
      this.ready = false;
      this.scheduleReconnect('initialize_error');
    } finally {
      this.initializing = false;
    }
  }

  private scheduleReconnect(from: string) {
    if (this.reconnectTimer) return;

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
      try {
        await this.buildClient();
      } catch (e) {
        this.logger.error(`Error rebuilding client: ${String(e)}`);
      }
      await this.initializeClient();
    }, delay);
  }

  get isReady(): boolean {
    return this.ready;
  }

  getClient(): Client {
    return this.client;
  }
}
