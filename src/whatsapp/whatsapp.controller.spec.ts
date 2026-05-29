import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { SendMessageDto } from './dto/send-message.dto';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('WhatsappController', () => {
  let controller: WhatsappController;
  let messagingService: DeepMocked<WhatsappMessagingService>;

  beforeEach(async () => {
    messagingService = createMock<WhatsappMessagingService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [
        { provide: WhatsappMessagingService, useValue: messagingService },
      ],
    }).compile();

    controller = module.get<WhatsappController>(WhatsappController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return the client status', () => {
      messagingService.getClientStatus.mockReturnValue({ isReady: true });
      expect(controller.getStatus()).toEqual({ isReady: true });
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const dto = new SendMessageDto();
      dto.phoneNumber = faker.phone.number();
      dto.message = faker.lorem.sentence();
      const expectedResult = {
        success: true,
        message: 'Message sent successfully',
      };
      messagingService.sendMessage.mockResolvedValue(expectedResult);

      const result = await controller.sendMessage(dto);
      expect(messagingService.sendMessage).toHaveBeenCalledWith(
        dto.phoneNumber,
        dto.message,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException with Error message on Error', async () => {
      const dto = new SendMessageDto();
      dto.phoneNumber = faker.phone.number();
      dto.message = faker.lorem.sentence();
      messagingService.sendMessage.mockRejectedValue(new Error('client error'));

      await expect(controller.sendMessage(dto)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException with default message on non-Error', async () => {
      const dto = new SendMessageDto();
      dto.phoneNumber = faker.phone.number();
      dto.message = faker.lorem.sentence();
      messagingService.sendMessage.mockRejectedValue('some string error');

      await expect(controller.sendMessage(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('getChats', () => {
    it('should return chats successfully', async () => {
      const chats = [{ id: '1' }, { id: '2' }] as never[];
      messagingService.getChats.mockResolvedValue(chats);

      const result = await controller.getChats();
      expect(result).toEqual(chats);
    });

    it('should throw HttpException with Error message on Error', async () => {
      messagingService.getChats.mockRejectedValue(new Error('chats error'));

      await expect(controller.getChats()).rejects.toThrow(HttpException);
    });

    it('should throw HttpException with default message on non-Error', async () => {
      messagingService.getChats.mockRejectedValue('raw failure');

      await expect(controller.getChats()).rejects.toThrow(HttpException);
    });
  });
});
