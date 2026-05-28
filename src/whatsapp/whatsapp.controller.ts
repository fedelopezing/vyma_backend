import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappMessagingService: WhatsappMessagingService,
  ) {}

  @Get('status')
  getStatus() {
    return this.whatsappMessagingService.getClientStatus();
  }

  @ApiBearerAuth()
  @Post('send-message')
  @UseGuards(AuthGuard('jwt'))
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      const { phoneNumber, message } = sendMessageDto;
      return await this.whatsappMessagingService.sendMessage(
        phoneNumber,
        message,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth()
  @Get('chats')
  @UseGuards(AuthGuard('jwt'))
  async getChats() {
    try {
      return await this.whatsappMessagingService.getChats();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get chats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
