import { Test, TestingModule } from '@nestjs/testing';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { StaffStatus } from './constants/staff-enums';

describe('StaffController', () => {
  let controller: StaffController;
  let service: jest.Mocked<Partial<StaffService>>;

  beforeEach(async () => {
    const mockStaffService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      changeStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
      ],
    })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ModuleAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StaffController>(StaffController);
    service = module.get(StaffService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service findAll with merged query', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 } as any;
      (service.findAll as jest.Mock).mockResolvedValue(result);

      expect(await controller.findAll({ page: 1, limit: 10 }, 1)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        companyId: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should call service findById', async () => {
      const result = { id: 1 } as any;
      (service.findById as jest.Mock).mockResolvedValue(result);

      expect(await controller.findOne(1, 1)).toBe(result);
      expect(service.findById).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('create', () => {
    it('should call service create', async () => {
      const dto = { firstName: 'Juan' } as any;
      const result = { id: 1 } as any;
      (service.create as jest.Mock).mockResolvedValue(result);

      expect(await controller.create(dto, 1)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto, 1);
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const dto = { firstName: 'Juan' } as any;
      const result = { id: 1 } as any;
      (service.update as jest.Mock).mockResolvedValue(result);

      expect(await controller.update(1, dto, 1)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, dto, 1);
    });
  });

  describe('changeStatus', () => {
    it('should call service changeStatus', async () => {
      const result = { id: 1, status: StaffStatus.INACTIVE } as any;
      (service.changeStatus as jest.Mock).mockResolvedValue(result);

      expect(await controller.changeStatus(1, StaffStatus.INACTIVE, 1)).toBe(
        result,
      );
      expect(service.changeStatus).toHaveBeenCalledWith(
        1,
        StaffStatus.INACTIVE,
        1,
      );
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove(1, 1);
      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });
});
