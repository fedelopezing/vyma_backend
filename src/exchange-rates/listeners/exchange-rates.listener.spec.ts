import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRatesListener } from './exchange-rates.listener';
import { EmailService } from '../../email/email.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('ExchangeRatesListener', () => {
  let listener: ExchangeRatesListener;
  let mockEmailService: DeepMocked<EmailService>;

  beforeEach(async () => {
    mockEmailService = createMock<EmailService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesListener,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    listener = module.get<ExchangeRatesListener>(ExchangeRatesListener);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleScrapingFailedEvent', () => {
    it('should call emailService.sendSystemAlert with correct parameters', async () => {
      const payload = {
        error: 'Connection timeout',
        timestamp: new Date('2026-06-17T06:00:00.000Z'),
      };

      await listener.handleScrapingFailedEvent(payload);

      expect(mockEmailService.sendSystemAlert).toHaveBeenCalledWith(
        'Alerta: Fallo en scraping de cotizaciones',
        expect.stringContaining('Connection timeout'),
      );
    });

    it('should catch errors from emailService and not rethrow', async () => {
      const payload = {
        error: 'Connection timeout',
        timestamp: new Date('2026-06-17T06:00:00.000Z'),
      };

      mockEmailService.sendSystemAlert.mockRejectedValue(
        new Error('Email service down'),
      );

      await expect(
        listener.handleScrapingFailedEvent(payload),
      ).resolves.toBeUndefined();

      expect(mockEmailService.sendSystemAlert).toHaveBeenCalled();
    });
  });
});
