import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client;
  private isReady: boolean = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.initializeClient();
  }

  private initializeClient() {
    const stage = this.configService.get<string>('STAGE', 'dev');

    // Configuración según el entorno
    const puppeteerConfig =
      stage === 'dev'
        ? {
            // Configuración para Windows (desarrollo)
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          }
        : {
            // Configuración para Linux (producción)
            executablePath: '/usr/bin/chromium-browser',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          };

    // Create a new client instance
    this.client = new Client({
      puppeteer: puppeteerConfig,
    });

    // When the client is ready, run this code (only once)
    this.client.once('ready', () => {
      this.logger.log('Client is ready!');
      this.isReady = true;
    });

    // When the client received QR-Code
    this.client.on('qr', (qr) => {
      this.logger.log('QR RECEIVED');
      // Generate QR code in terminal
      qrcode.generate(qr, { small: true });
      console.log('QR RECEIVED', qr);
    });

    // Handle authentication
    this.client.on('authenticated', () => {
      this.logger.log('Client authenticated successfully');
    });

    // Handle authentication failure
    this.client.on('auth_failure', (message) => {
      this.logger.error('Authentication failed', message);
    });

    // Handle disconnection
    this.client.on('disconnected', (reason) => {
      this.logger.warn('Client disconnected', reason);
      this.isReady = false;
    });

    // Start your client
    this.client.initialize();
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
