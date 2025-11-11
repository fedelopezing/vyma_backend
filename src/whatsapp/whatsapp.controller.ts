import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getClientStatus();
  }

  @Post('send-message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      const { phoneNumber, message } = sendMessageDto;
      
      if (!phoneNumber || !message) {
        throw new HttpException(
          'Phone number and message are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.whatsappService.sendMessage(phoneNumber, message);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('chats')
  async getChats() {
    try {
      return await this.whatsappService.getChats();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get chats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

