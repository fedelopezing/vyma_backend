import { Injectable, Logger } from '@nestjs/common';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { getErrorMessage } from '../common/helpers/errors.helper';

@Injectable()
export class WhatsappMessagingService {
  private readonly logger = new Logger(WhatsappMessagingService.name);

  constructor(private connectionService: WhatsappConnectionService) {}

  getClientStatus(): { isReady: boolean } {
    return { isReady: this.connectionService.isReady };
  }

  async sendMessage(phoneNumber: string, message: string) {
    if (!this.connectionService.isReady) {
      throw new Error('WhatsApp client is not ready yet');
    }

    try {
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const chatId = `${formattedNumber}@c.us`;

      const client = this.connectionService.getClient();
      await client.sendMessage(chatId, message);
      this.logger.log(`Message sent to ${phoneNumber}`);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      const msg = getErrorMessage(error, String(error));
      this.logger.error(`Failed to send message: ${msg}`);
      throw error;
    }
  }

  async getChats() {
    if (!this.connectionService.isReady) {
      throw new Error('WhatsApp client is not ready yet');
    }

    const client = this.connectionService.getClient();
    const chats = await client.getChats();
    return chats;
  }
}
