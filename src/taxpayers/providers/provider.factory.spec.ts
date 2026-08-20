import { Test, TestingModule } from '@nestjs/testing';
import { TaxpayerProviderFactory } from './provider.factory';
import { PyDnitPublicProvider } from './py-dnit-public.provider';

describe('TaxpayerProviderFactory', () => {
  let factory: TaxpayerProviderFactory;
  let pyDnitProvider: PyDnitPublicProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxpayerProviderFactory,
        {
          provide: PyDnitPublicProvider,
          useValue: {
            fetchByDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    factory = module.get<TaxpayerProviderFactory>(TaxpayerProviderFactory);
    pyDnitProvider = module.get<PyDnitPublicProvider>(PyDnitPublicProvider);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  it('debería retornar PyDnitPublicProvider para PY (case-insensitive)', () => {
    expect(factory.getProvider('PY')).toBe(pyDnitProvider);
    expect(factory.getProvider('py')).toBe(pyDnitProvider);
  });

  it('debería lanzar excepción si el país no está soportado', () => {
    expect(() => factory.getProvider('AR')).toThrow(
      'Provider for country AR not found',
    );
  });
});
