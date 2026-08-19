import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { PyDnitPublicProvider } from './py-dnit-public.provider';
import { TaxpayerStatus, TaxpayerType } from '../constants/taxpayers-enums';

describe('PyDnitPublicProvider', () => {
  let provider: PyDnitPublicProvider;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PyDnitPublicProvider,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<PyDnitPublicProvider>(PyDnitPublicProvider);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('fetchByDocument', () => {
    it('debería retornar datos mapeados correctamente cuando la API responde', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          data: {
            doc: 80012345,
            razonSocial: 'EMPRESA EJEMPLO S.A.',
            dv: 0,
            ruc: '80012345-0',
            estado: 'ACTIVO',
            esPersonaJuridica: true,
            direccion: 'Avda. Espana 123',
            ciudad: 'Asuncion',
            telefono: '021123456',
            correo: 'contacto@ejemplo.com',
            actividadEconomica: 'Servicios',
          },
          message: 'OK',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await provider.fetchByDocument('80012345', '0');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://turuc.com.py/api/contribuyente/80012345',
        expect.objectContaining({
          timeout: 3000,
        }),
      );
      expect(result).toBeDefined();
      expect(result?.businessName).toBe('EMPRESA EJEMPLO S.A.');
      expect(result?.status).toBe(TaxpayerStatus.ACTIVO);
      expect(result?.taxpayerType).toBe(TaxpayerType.PERSONA_JURIDICA);
      expect(result?.address).toBe('Avda. Espana 123');
    });

    it('debería retornar null si la respuesta no tiene razon_social', async () => {
      const mockResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await provider.fetchByDocument('80012345', '0');

      expect(result).toBeNull();
    });

    it('debería retornar null silenciosamente ante un AxiosError', async () => {
      const axiosError = new AxiosError('Timeout');
      httpService.get.mockReturnValue(throwError(() => axiosError));

      const result = await provider.fetchByDocument('80012345', '0');

      expect(result).toBeNull();
    });

    it('debería retornar null ante cualquier otra excepción', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('Unknown')));

      const result = await provider.fetchByDocument('80012345', '0');

      expect(result).toBeNull();
    });
  });
});
