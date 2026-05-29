import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { getErrorMessage } from '../common/helpers/errors.helper';

@ApiTags('whatsapp')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappMessagingService: WhatsappMessagingService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Estado de la conexión WhatsApp' })
  getStatus() {
    return this.whatsappMessagingService.getClientStatus();
  }

  @Post('send-message')
  @ApiOperation({ summary: 'Enviar un mensaje de WhatsApp' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      const { phoneNumber, message } = sendMessageDto;
      return await this.whatsappMessagingService.sendMessage(
        phoneNumber,
        message,
      );
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send message');
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('chats')
  @ApiOperation({ summary: 'Obtener todos los chats de WhatsApp' })
  async getChats() {
    try {
      return await this.whatsappMessagingService.getChats();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to get chats');
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
