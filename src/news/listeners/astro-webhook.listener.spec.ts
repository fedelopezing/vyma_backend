import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AstroWebhookListener } from './astro-webhook.listener';
import { NewsPublishedEvent } from '../events/news-published.event';

import { NewsStatus } from '../entities/news.entity';

describe('AstroWebhookListener', () => {
  let listener: AstroWebhookListener;
  let configService: jest.Mocked<ConfigService>;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEvent = new NewsPublishedEvent(
    'uuid-123',
    'slug-es-1',
    'slug-en-1',
    NewsStatus.PUBLICADO,
  );

  beforeEach(async () => {
    // Resetear el mock global de fetch
    global.fetch = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AstroWebhookListener,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    listener = module.get<AstroWebhookListener>(AstroWebhookListener);
    configService = module.get(ConfigService);

    // Espiar el Logger para verificar que registra pero no lanza errores
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(listener).toBeDefined();
  });

  it('✅ Webhook responde 200: Realiza la petición HTTP con el payload correcto y no lanza error', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'ASTRO_WEBHOOK_URL') return 'http://test.com/revalidate';
      if (key === 'ASTRO_WEBHOOK_SECRET') return 'secret-123';
      return null;
    });

    const mockResponse = { ok: true, status: 200 } as Response;
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(
      listener.handleNewsPublishedEvent(mockEvent),
    ).resolves.not.toThrow();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.com/revalidate',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secret-123',
        },
        body: expect.stringContaining('"slugEs":"slug-es-1"'),
      }),
    );
    expect(loggerLogSpy).toHaveBeenCalledWith(
      'Astro webhook llamado exitosamente.',
    );
  });

  it('❌ Webhook falla con error de red: Captura el error, lo registra en el logger y NO relanza la excepción', async () => {
    configService.get.mockReturnValue('http://test.com/revalidate');

    const mockNetworkError = new Error('ECONNREFUSED');
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockNetworkError);

    // No debe lanzar error
    await expect(
      listener.handleNewsPublishedEvent(mockEvent),
    ).resolves.not.toThrow();

    expect(global.fetch).toHaveBeenCalled();
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error de red o timeout al intentar conectar con el Astro Webhook',
      expect.any(String),
    );
  });

  it('❌ Webhook responde 500: Captura el error y el listener finaliza sin propagarlo', async () => {
    configService.get.mockReturnValue('http://test.com/revalidate');

    const mockResponse = { ok: false, status: 500 } as Response;
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(
      listener.handleNewsPublishedEvent(mockEvent),
    ).resolves.not.toThrow();

    expect(global.fetch).toHaveBeenCalled();
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Astro webhook falló con el status: 500',
    );
  });

  it('Debería omitir la ejecución si ASTRO_WEBHOOK_URL no está configurado', async () => {
    configService.get.mockReturnValue(undefined);

    await listener.handleNewsPublishedEvent(mockEvent);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      'ASTRO_WEBHOOK_URL no está configurado. Se omitirá la llamada al webhook.',
    );
  });
});
