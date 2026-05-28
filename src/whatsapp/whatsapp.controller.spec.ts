import { Test, TestingModule } from '@nestjs/testing';
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

  it('should send a message', async () => {
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
});
