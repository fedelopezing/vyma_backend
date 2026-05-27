import { Module } from '@nestjs/common';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { WhatsappController } from './whatsapp.controller';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappConnectionService, WhatsappMessagingService],
  exports: [WhatsappConnectionService, WhatsappMessagingService],
})
export class WhatsappModule {}
