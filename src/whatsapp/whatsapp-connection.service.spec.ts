import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import { Client } from 'whatsapp-web.js';

jest.mock('whatsapp-web.js', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      initialize: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
    })),
    LocalAuth: jest.fn(),
  };
});

jest.mock('qrcode-terminal', () => ({
  generate: jest.fn(),
}));

describe('WhatsappConnectionService', () => {
  let service: WhatsappConnectionService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappConnectionService,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
      ],
    }).compile();

    service = module.get<WhatsappConnectionService>(WhatsappConnectionService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should log and return if WHATSAPP_ENABLED is not true', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('false');
      const loggerSpy = jest.spyOn((service as any).logger, 'log');

      await service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith('WHATSAPP_ENABLED');
      expect(loggerSpy).toHaveBeenCalledWith(
        'WhatsApp connection is disabled (WHATSAPP_ENABLED is not set to true)',
      );
    });

    it('should not initialize client if WHATSAPP_ENABLED is true (temporarily disabled)', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('true');
      const loggerSpy = jest.spyOn((service as any).logger, 'log');

      await service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith('WHATSAPP_ENABLED');
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear reconnectTimer if it exists', async () => {
      jest.useFakeTimers();
      (service as any).reconnectTimer = setTimeout(() => {}, 1000);
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      await service.onModuleDestroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should destroy the client if it exists', async () => {
      const mockClient = createMock<Client>();
      (service as any).client = mockClient;

      await service.onModuleDestroy();

      expect(mockClient.destroy).toHaveBeenCalled();
    });

    it('should catch and log error if client.destroy fails', async () => {
      const mockClient = createMock<Client>();
      const error = new Error('Destroy failed');
      mockClient.destroy.mockRejectedValue(error);
      (service as any).client = mockClient;

      const loggerWarnSpy = jest.spyOn((service as any).logger, 'warn');

      await service.onModuleDestroy();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        `Error destroying WhatsApp client: ${error}`,
      );
    });
  });

  describe('isReady', () => {
    it('should return the ready state', () => {
      (service as any).ready = true;
      expect(service.isReady).toBe(true);

      (service as any).ready = false;
      expect(service.isReady).toBe(false);
    });
  });

  describe('getClient', () => {
    it('should return the client instance', () => {
      const mockClient = createMock<Client>();
      (service as any).client = mockClient;

      expect(service.getClient()).toBe(mockClient);
    });
  });

  describe('buildClient (private)', () => {
    it('should build client correctly for dev stage', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'STAGE') return 'dev';
        if (key === 'WHATSAPP_CLIENT_ID') return 'test-client';
        return null;
      });

      await (service as any).buildClient();

      expect(service.getClient()).toBeDefined();
    });

    it('should build client correctly for prod stage', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'STAGE') return 'prod';
        if (key === 'CHROME_EXECUTABLE_PATH') return '/custom/path/chromium';
        if (key === 'WHATSAPP_CLIENT_ID') return 'test-client';
        return null;
      });

      await (service as any).buildClient();

      expect(service.getClient()).toBeDefined();
    });
  });

  describe('initializeClient (private)', () => {
    it('should initialize the client', async () => {
      const mockClient = createMock<Client>();
      (service as any).client = mockClient;

      await (service as any).initializeClient();

      expect(mockClient.initialize).toHaveBeenCalled();
      expect((service as any).initializing).toBe(false);
    });

    it('should catch error on initialize and schedule reconnect', async () => {
      const mockClient = createMock<Client>();
      mockClient.initialize.mockRejectedValue(new Error('Init Error'));
      (service as any).client = mockClient;

      const scheduleSpy = jest
        .spyOn(service as any, 'scheduleReconnect')
        .mockImplementation(() => {});

      await (service as any).initializeClient();

      expect(mockClient.initialize).toHaveBeenCalled();
      expect((service as any).ready).toBe(false);
      expect(scheduleSpy).toHaveBeenCalledWith('initialize_error');
    });

    it('should not initialize if already initializing', async () => {
      (service as any).initializing = true;
      const mockClient = createMock<Client>();
      (service as any).client = mockClient;

      await (service as any).initializeClient();

      expect(mockClient.initialize).not.toHaveBeenCalled();
    });
  });

  describe('scheduleReconnect (private)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should schedule a reconnect if no timer exists', () => {
      const loggerWarnSpy = jest.spyOn((service as any).logger, 'warn');

      (service as any).scheduleReconnect('test_reason');

      expect((service as any).reconnectAttempts).toBe(1);
      expect((service as any).reconnectTimer).not.toBeNull();
      expect(loggerWarnSpy).toHaveBeenCalled();
    });

    it('should execute reconnect callback after delay', async () => {
      (service as any).scheduleReconnect('test_reason');

      const buildClientSpy = jest
        .spyOn(service as any, 'buildClient')
        .mockResolvedValue(undefined);
      const initializeClientSpy = jest
        .spyOn(service as any, 'initializeClient')
        .mockResolvedValue(undefined);

      jest.runAllTimers();

      await Promise.resolve(); // allow microtasks to flush

      expect((service as any).reconnectTimer).toBeNull();
      expect(buildClientSpy).toHaveBeenCalled();
      expect(initializeClientSpy).toHaveBeenCalled();
    });

    it('should not schedule if timer already exists', () => {
      (service as any).reconnectTimer = setTimeout(() => {}, 1000);
      const initialAttempts = (service as any).reconnectAttempts;

      (service as any).scheduleReconnect('test_reason');

      expect((service as any).reconnectAttempts).toBe(initialAttempts);
    });
  });
});
