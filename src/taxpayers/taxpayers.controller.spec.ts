import { Test, TestingModule } from '@nestjs/testing';
import { TaxpayersController } from './taxpayers.controller';
import { TaxpayersService } from './taxpayers.service';
import { TaxpayersDirectoryService } from './taxpayers.directory.service';
import { LookupTaxpayerDto, SearchTaxpayerDto, ValidateDvDto } from './dto';

describe('TaxpayersController', () => {
  let controller: TaxpayersController;
  let taxpayersService: jest.Mocked<TaxpayersService>;
  let directoryService: jest.Mocked<TaxpayersDirectoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxpayersController],
      providers: [
        {
          provide: TaxpayersService,
          useValue: {
            lookup: jest.fn(),
            validateDv: jest.fn(),
          },
        },
        {
          provide: TaxpayersDirectoryService,
          useValue: {
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaxpayersController>(TaxpayersController);
    taxpayersService = module.get(TaxpayersService);
    directoryService = module.get(TaxpayersDirectoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('lookup', () => {
    it('debería llamar a taxpayersService.lookup y retornar el resultado', async () => {
      const dto: LookupTaxpayerDto = { document: '80012345', country: 'PY' };
      const expectedResponse = {
        found: true,
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
        businessName: 'EMPRESA TEST S.A.',
        fromCache: false,
        manualEntryRequired: false,
      };

      taxpayersService.lookup.mockResolvedValue(expectedResponse as any);

      const result = await controller.lookup(dto);

      expect(taxpayersService.lookup).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('validateDv', () => {
    it('debería llamar a taxpayersService.validateDv y retornar el resultado', () => {
      const dto: ValidateDvDto = { document: '80012345', country: 'PY' };
      const expectedResponse = {
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
      };

      taxpayersService.validateDv.mockReturnValue(expectedResponse);

      const result = controller.validateDv(dto);

      expect(taxpayersService.validateDv).toHaveBeenCalledWith(
        '80012345',
        'PY',
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('search', () => {
    it('debería llamar a directoryService.search y retornar los resultados', async () => {
      const dto: SearchTaxpayerDto = { q: 'IMPORTADORA', country: 'PY' };
      const expectedResponse = [
        {
          found: true,
          documentNumber: '80012345',
          dv: '0',
          ruc: '80012345-0',
          businessName: 'IMPORTADORA TEST S.A.',
          fromCache: true,
          manualEntryRequired: false,
        },
      ];

      directoryService.search.mockResolvedValue(expectedResponse as any);

      const result = await controller.search(dto);

      expect(directoryService.search).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
