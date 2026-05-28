import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('WhatsappMessagingService', () => {
  let service: WhatsappMessagingService;
  let connectionService: DeepMocked<WhatsappConnectionService>;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      sendMessage: jest.fn().mockResolvedValue(true),
      getChats: jest.fn().mockResolvedValue([]),
    };

    connectionService = createMock<WhatsappConnectionService>();
    (connectionService as any).isReady = true;
    connectionService.getClient.mockReturnValue(mockClient as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappMessagingService,
        { provide: WhatsappConnectionService, useValue: connectionService },
      ],
    }).compile();

    service = module.get<WhatsappMessagingService>(WhatsappMessagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a message', async () => {
    const phone = faker.phone.number();
    const message = faker.lorem.sentence();
    const result = await service.sendMessage(phone, message);
    expect(result.success).toBe(true);
    expect(mockClient.sendMessage).toHaveBeenCalled();
  });
});
