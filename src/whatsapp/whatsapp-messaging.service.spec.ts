import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappMessagingService } from './whatsapp-messaging.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('WhatsappMessagingService', () => {
  let service: WhatsappMessagingService;
  let connectionService: DeepMocked<WhatsappConnectionService>;
  let mockClient: { sendMessage: jest.Mock; getChats: jest.Mock };

  beforeEach(async () => {
    mockClient = {
      sendMessage: jest.fn().mockResolvedValue(true),
      getChats: jest.fn().mockResolvedValue([]),
    };

    connectionService = createMock<WhatsappConnectionService>();
    (connectionService as unknown as { isReady: boolean }).isReady = true;
    connectionService.getClient.mockReturnValue(mockClient as never);

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

  describe('getClientStatus', () => {
    it('should return isReady: true when client is ready', () => {
      expect(service.getClientStatus()).toEqual({ isReady: true });
    });

    it('should return isReady: false when client is not ready', () => {
      (connectionService as unknown as { isReady: boolean }).isReady = false;
      expect(service.getClientStatus()).toEqual({ isReady: false });
    });
  });

  describe('sendMessage', () => {
    it('should send a message when client is ready', async () => {
      const phone = faker.phone.number();
      const message = faker.lorem.sentence();
      const result = await service.sendMessage(phone, message);
      expect(result.success).toBe(true);
      expect(mockClient.sendMessage).toHaveBeenCalled();
    });

    it('should throw when client is not ready', async () => {
      (connectionService as unknown as { isReady: boolean }).isReady = false;
      await expect(service.sendMessage('123', 'hello')).rejects.toThrow(
        'WhatsApp client is not ready yet',
      );
    });

    it('should propagate errors from the client', async () => {
      mockClient.sendMessage.mockRejectedValue(new Error('send failed'));
      await expect(service.sendMessage('123', 'hello')).rejects.toThrow(
        'send failed',
      );
    });
  });

  describe('getChats', () => {
    it('should return chats when client is ready', async () => {
      const fakeChats = [{ id: 'chat1' }] as never[];
      mockClient.getChats.mockResolvedValue(fakeChats);

      const result = await service.getChats();
      expect(result).toEqual(fakeChats);
    });

    it('should throw when client is not ready', async () => {
      (connectionService as unknown as { isReady: boolean }).isReady = false;
      await expect(service.getChats()).rejects.toThrow(
        'WhatsApp client is not ready yet',
      );
    });
  });
});
