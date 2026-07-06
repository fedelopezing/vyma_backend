import { Test, TestingModule } from '@nestjs/testing';

import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { Ad } from './entities/ad.entity';
import { CreateAdDto, UpdateAdDto, AdsPaginationDto } from './dto';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { CompaniesRepository } from '../companies/repositories/companies.repository';

describe('AdsController', () => {
  let controller: AdsController;
  let service: jest.Mocked<AdsService>;

  const mockAd = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    imageUrlEs: 'https://cloudinary.com/image-es.jpg',
    isActive: true,
    order: 1,
    companyId: 10,
  } as Ad;

  const mockAdsService = {
    findActive: jest.fn(),
    findAllAdmin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserCompanyRepository = {
    isActiveMember: jest.fn().mockResolvedValue(true),
  };

  const mockCompaniesRepository = {
    findByUuid: jest.fn().mockResolvedValue({ id: 10, isActive: true }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsController],
      providers: [
        { provide: AdsService, useValue: mockAdsService },
        { provide: UserCompanyRepository, useValue: mockUserCompanyRepository },
        { provide: CompaniesRepository, useValue: mockCompaniesRepository },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(ModuleAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AdsController>(AdsController);
    service = module.get(AdsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findActive', () => {
    it('debería retornar banners activos si companyUuid es un UUID válido', async () => {
      service.findActive.mockResolvedValue([mockAd]);

      const result = await controller.findActive(
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      expect(result).toEqual([mockAd]);
      expect(service.findActive).toHaveBeenCalledWith(10);
    });
  });

  describe('findAllAdmin', () => {
    it('debería llamar a service.findAllAdmin y retornar la lista paginada', async () => {
      const paginationDto: AdsPaginationDto = { page: 1, limit: 10 };
      const expectedResponse = {
        data: [mockAd],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      service.findAllAdmin.mockResolvedValue(expectedResponse);

      const result = await controller.findAllAdmin(paginationDto, 10);

      expect(result).toEqual(expectedResponse);
      expect(service.findAllAdmin).toHaveBeenCalledWith(paginationDto, 10);
    });
  });

  describe('create', () => {
    it('debería llamar a service.create con el DTO y el ID de empresa', async () => {
      const dto: CreateAdDto = {
        imageUrlEs: 'https://cloudinary.com/image-es.jpg',
      };
      service.create.mockResolvedValue(mockAd);

      const result = await controller.create(dto, 10);

      expect(result).toEqual(mockAd);
      expect(service.create).toHaveBeenCalledWith(dto, 10);
    });
  });

  describe('update', () => {
    it('debería llamar a service.update con el ID y el DTO de actualización', async () => {
      const dto: UpdateAdDto = { order: 5 };
      service.update.mockResolvedValue({ ...mockAd, order: 5 } as Ad);

      const result = await controller.update(mockAd.id, dto, mockAd.companyId);

      expect(result.order).toBe(5);
      expect(service.update).toHaveBeenCalledWith(
        mockAd.id,
        dto,
        mockAd.companyId,
      );
    });
  });

  describe('remove', () => {
    it('debería llamar a service.remove con el ID', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockAd.id, mockAd.companyId);

      expect(service.remove).toHaveBeenCalledWith(mockAd.id, mockAd.companyId);
    });
  });
});
