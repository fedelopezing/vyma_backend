import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from './repositories/companies.repository';
import { UserCompanyRepository } from './repositories/user-company.repository';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { CompanyNotFoundException } from './exceptions/company-not-found.exception';
import { MemberAlreadyExistsException } from './exceptions/member-already-exists.exception';
import { CompanyAlreadyExistsException } from './exceptions/company-already-exists.exception';
import { NotFoundException } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { UserCompany } from './entities/user-company.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companiesRepo: jest.Mocked<CompaniesRepository>;
  let userCompanyRepo: jest.Mocked<UserCompanyRepository>;
  let usersService: jest.Mocked<UsersService>;
  let rolesService: jest.Mocked<RolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: CompaniesRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUuid: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserCompanyRepository,
          useValue: {
            addMember: jest.fn(),
            removeMember: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByUuid: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companiesRepo = module.get(CompaniesRepository);
    userCompanyRepo = module.get(UserCompanyRepository);
    usersService = module.get(UsersService);
    rolesService = module.get(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Test Company', taxId: '123' };
      const company = { id: 1, uuid: 'company-uuid', ...dto } as Company;
      companiesRepo.create.mockResolvedValue(company);

      const result = await service.create(dto);
      expect(result).toEqual(company);
      expect(companiesRepo.create).toHaveBeenCalledWith(dto);
    });

    it('should throw CompanyAlreadyExistsException when repository throws conflict', async () => {
      const dto = { name: 'Test Company', taxId: '123' };
      companiesRepo.create.mockRejectedValue({ code: '23505' });

      await expect(service.create(dto)).rejects.toThrow(
        CompanyAlreadyExistsException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies = [{ id: 1, name: 'Company A' }] as Company[];
      companiesRepo.findAll.mockResolvedValue(companies);

      const result = await service.findAll();
      expect(result).toEqual(companies);
      expect(companiesRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUuid', () => {
    it('should return a company when found', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      companiesRepo.findByUuid.mockResolvedValue(company);

      const result = await service.findByUuid('company-uuid');
      expect(result).toEqual(company);
      expect(companiesRepo.findByUuid).toHaveBeenCalledWith('company-uuid');
    });

    it('should throw CompanyNotFoundException when not found', async () => {
      companiesRepo.findByUuid.mockResolvedValue(null);

      await expect(service.findByUuid('not-found-uuid')).rejects.toThrow(
        CompanyNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      const dto = { name: 'Company Updated' };
      const updatedCompany = { ...company, ...dto } as Company;
      companiesRepo.findByUuid.mockResolvedValue(company);
      companiesRepo.update.mockResolvedValue(updatedCompany);

      const result = await service.update('company-uuid', dto);
      expect(result).toEqual(updatedCompany);
      expect(companiesRepo.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('addMember', () => {
    it('should successfully add a member', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      const user = {
        id: 10,
        uuid: 'user-uuid',
        email: 'user@test.com',
      } as User;
      const role = { id: 2, name: 'admin' } as Role;
      const membership = {
        userId: 10,
        companyId: 1,
        roleId: 2,
        isActive: true,
      } as UserCompany;

      companiesRepo.findByUuid.mockResolvedValue(company);
      usersService.findOneByUuid.mockResolvedValue(user);
      rolesService.findOne.mockResolvedValue(role);
      userCompanyRepo.addMember.mockResolvedValue(membership);

      const result = await service.addMember('company-uuid', {
        userUuid: 'user-uuid',
        roleId: 2,
      });

      expect(result).toEqual(membership);
      expect(userCompanyRepo.addMember).toHaveBeenCalledWith(10, 1, 2);
    });

    it('should throw MemberAlreadyExistsException when repository throws conflict', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      const user = {
        id: 10,
        uuid: 'user-uuid',
        email: 'user@test.com',
      } as User;
      const role = { id: 2, name: 'admin' } as Role;

      companiesRepo.findByUuid.mockResolvedValue(company);
      usersService.findOneByUuid.mockResolvedValue(user);
      rolesService.findOne.mockResolvedValue(role);
      userCompanyRepo.addMember.mockRejectedValue({ code: '23505' });

      await expect(
        service.addMember('company-uuid', {
          userUuid: 'user-uuid',
          roleId: 2,
        }),
      ).rejects.toThrow(MemberAlreadyExistsException);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      companiesRepo.findByUuid.mockResolvedValue(company);
      usersService.findOneByUuid.mockResolvedValue(null);

      await expect(
        service.addMember('company-uuid', {
          userUuid: 'non-existent',
          roleId: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMember', () => {
    it('should successfully remove a member', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      const user = {
        id: 10,
        uuid: 'user-uuid',
        email: 'user@test.com',
      } as User;

      companiesRepo.findByUuid.mockResolvedValue(company);
      usersService.findOneByUuid.mockResolvedValue(user);
      userCompanyRepo.removeMember.mockResolvedValue(undefined);

      await service.removeMember('company-uuid', 'user-uuid');

      expect(userCompanyRepo.removeMember).toHaveBeenCalledWith(10, 1);
    });

    it('should throw NotFoundException when user is not found for removal', async () => {
      const company = {
        id: 1,
        uuid: 'company-uuid',
        name: 'Company A',
      } as Company;
      companiesRepo.findByUuid.mockResolvedValue(company);
      usersService.findOneByUuid.mockResolvedValue(null);

      await expect(
        service.removeMember('company-uuid', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
