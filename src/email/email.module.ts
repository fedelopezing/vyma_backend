import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { EmailSentListener } from './listeners/email-sent.listener';

@Module({
  imports: [WhatsappModule],
  controllers: [EmailController],
  providers: [EmailService, EmailSentListener],
  exports: [EmailService],
})
export class EmailModule {}
