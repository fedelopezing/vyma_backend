import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';

describe('WhatsappMessagingService', () => {
  let service: WhatsappMessagingService;
  let connectionService: jest.Mocked<Partial<WhatsappConnectionService>>;

  beforeEach(async () => {
    connectionService = {
      isReady: true,
      getClient: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue(true),
        getChats: jest.fn().mockResolvedValue([]),
      }),
    } as any;

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
    const result = await service.sendMessage('1234567890', 'Hello');
    expect(result.success).toBe(true);
  });
});
