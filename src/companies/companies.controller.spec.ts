import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto, AddMemberDto } from './dto';
import { Company } from './entities/company.entity';
import { UserCompany } from './entities/user-company.entity';

import { PermissionsGuard } from '../auth/guards/permissions.guard';

const mockSuperAdminReq = {
  user: { isSuperAdmin: true },
} as unknown as Parameters<CompaniesController['create']>[1];
const mockNonAdminReq = {
  user: { isSuperAdmin: false },
} as unknown as Parameters<CompaniesController['create']>[1];

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: jest.Mocked<CompaniesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUuid: jest.fn(),
            update: jest.fn(),
            addMember: jest.fn(),
            removeMember: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get(CompaniesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: CreateCompanyDto = { name: 'Test Company' };

    it('should delegate to service.create() and return the company', async () => {
      const company = { id: 1, name: 'Test Company' } as Company;
      service.create.mockResolvedValue(company);

      const result = await controller.create(dto, mockSuperAdminReq);

      expect(result).toEqual(company);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ForbiddenException if user is not superadmin', () => {
      expect(() => controller.create(dto, mockNonAdminReq)).toThrow(
        ForbiddenException,
      );
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should delegate to service.findAll() and return array', async () => {
      const companies = [{ id: 1, name: 'Test' }] as Company[];
      service.findAll.mockResolvedValue(companies);

      const result = await controller.findAll(mockSuperAdminReq);

      expect(result).toEqual(companies);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not superadmin', () => {
      expect(() => controller.findAll(mockNonAdminReq)).toThrow(
        ForbiddenException,
      );
      expect(service.findAll).not.toHaveBeenCalled();
    });
  });

  // ─── findByUuid ───────────────────────────────────────────────────────────

  describe('findByUuid', () => {
    it('should delegate to service.findByUuid() and return company', async () => {
      const uuid = 'test-uuid-1234';
      const company = { id: 1, uuid } as Company;
      service.findByUuid.mockResolvedValue(company);

      const result = await controller.findByUuid(uuid);

      expect(result).toEqual(company);
      expect(service.findByUuid).toHaveBeenCalledWith(uuid);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const uuid = 'test-uuid-1234';
    const dto: UpdateCompanyDto = { name: 'Updated Company' };

    it('should delegate to service.update() and return updated company', async () => {
      const company = { id: 1, name: 'Updated Company' } as Company;
      service.update.mockResolvedValue(company);

      const result = await controller.update(uuid, dto, mockSuperAdminReq);

      expect(result).toEqual(company);
      expect(service.update).toHaveBeenCalledWith(uuid, dto);
    });

    it('should throw ForbiddenException if user is not superadmin', () => {
      expect(() => controller.update(uuid, dto, mockNonAdminReq)).toThrow(
        ForbiddenException,
      );
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  // ─── addMember ────────────────────────────────────────────────────────────

  describe('addMember', () => {
    it('should delegate to service.addMember() and return membership', async () => {
      const uuid = 'company-uuid';
      const dto: AddMemberDto = { userUuid: 'user-uuid', roleId: 2 };
      const membership = { userId: 10, companyId: 1 } as UserCompany;
      service.addMember.mockResolvedValue(membership);

      const result = await controller.addMember(uuid, dto);

      expect(result).toEqual(membership);
      expect(service.addMember).toHaveBeenCalledWith(uuid, dto);
    });
  });

  // ─── removeMember ─────────────────────────────────────────────────────────

  describe('removeMember', () => {
    it('should delegate to service.removeMember() and return void', async () => {
      const uuid = 'company-uuid';
      const userUuid = 'user-uuid';
      service.removeMember.mockResolvedValue(undefined);

      await controller.removeMember(uuid, userUuid);

      expect(service.removeMember).toHaveBeenCalledWith(uuid, userUuid);
    });
  });
});
