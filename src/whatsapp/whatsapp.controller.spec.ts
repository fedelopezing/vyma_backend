import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { SendMessageDto } from './dto/send-message.dto';

describe('WhatsappController', () => {
  let controller: WhatsappController;
  let messagingService: jest.Mocked<Partial<WhatsappMessagingService>>;

  beforeEach(async () => {
    messagingService = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
      getChats: jest.fn().mockResolvedValue([]),
      getClientStatus: jest.fn().mockReturnValue({ isReady: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [
        { provide: WhatsappMessagingService, useValue: messagingService },
      ],
    }).compile();

    controller = module.get<WhatsappController>(WhatsappController);
  });

  it('should send a message', async () => {
    const dto = new SendMessageDto();
    dto.phoneNumber = '123';
    dto.message = 'hi';
    const result = await controller.sendMessage(dto);
    expect(messagingService.sendMessage).toHaveBeenCalledWith('123', 'hi');
    expect(result).toEqual({ success: true });
  });
});
