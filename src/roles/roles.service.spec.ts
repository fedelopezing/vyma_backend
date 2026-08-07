import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CacheService } from '../common/services/cache.service';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { RoleNotFoundException } from './exceptions/role-not-found.exception';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthCacheKeys } from '../auth/constants/cache-keys.constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RolesRepository } from './repositories/roles.repository';
import { PermissionsRepository } from '../permissions/repositories/permissions.repository';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleRepository: DeepMocked<RolesRepository>;
  let mockPermissionsRepository: DeepMocked<PermissionsRepository>;
  let mockUserCompanyRepository: DeepMocked<UserCompanyRepository>;
  let usersService: UsersService;
  let cacheService: CacheService;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  beforeEach(async () => {
    mockRoleRepository = createMock<RolesRepository>();
    mockPermissionsRepository = createMock<PermissionsRepository>();
    mockUserCompanyRepository = createMock<UserCompanyRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRoleRepository,
        },
        {
          provide: PermissionsRepository,
          useValue: mockPermissionsRepository,
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
        {
          provide: UserCompanyRepository,
          useValue: mockUserCompanyRepository,
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    usersService = module.get<UsersService>(UsersService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all roles with permissions relation', async () => {
      const mockRoles = [{ id: 1, name: 'admin', permissions: [] } as Role];
      mockRoleRepository.findAll.mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const mockRole = { id: 1, name: 'admin', permissions: [] } as Role;
      mockRoleRepository.findOneById.mockResolvedValue(mockRole);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findOneById).toHaveBeenCalledWith(1);
    });

    it('should throw RoleNotFoundException if role not found', async () => {
      mockRoleRepository.findOneById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(RoleNotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a role by id', async () => {
      const mockRole = { id: 1, name: 'admin', permissions: [] } as Role;
      mockRoleRepository.findOneById.mockResolvedValue(mockRole);
      mockRoleRepository.remove.mockResolvedValue(undefined as any);

      await service.remove(1);

      expect(mockRoleRepository.findOneById).toHaveBeenCalledWith(1);
      expect(mockRoleRepository.remove).toHaveBeenCalledWith(mockRole);
    });
  });

  describe('create', () => {
    it('should create a role without permissions', async () => {
      const dto = { name: 'admin' };
      const createdRole = { id: 1, name: 'admin' } as Role;

      mockRoleRepository.create.mockReturnValue(createdRole);
      mockRoleRepository.save.mockResolvedValue(createdRole);

      const result = await service.create(dto);

      expect(result).toEqual(createdRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRoleRepository.save).toHaveBeenCalledWith(createdRole);
    });

    it('should create a role with permissions', async () => {
      const dto = { name: 'admin', permissions: ['read:users'] };
      const createdRole = { id: 1, name: 'admin' } as Role;
      const permissions = [{ id: 1, action: 'read:users' }] as any;

      mockRoleRepository.create.mockReturnValue(createdRole);
      mockPermissionsRepository.findManyByActions.mockResolvedValue(
        permissions,
      );
      mockRoleRepository.save.mockResolvedValue({
        ...createdRole,
        permissions,
      } as Role);

      const result = await service.create(dto);

      expect(result).toEqual({ ...createdRole, permissions });
      expect(mockPermissionsRepository.findManyByActions).toHaveBeenCalledWith([
        'read:users',
      ]);
    });
  });

  describe('update', () => {
    it('should update a role and emit role.updated event', async () => {
      const dto = { name: 'superadmin', permissions: ['read:users'] };
      const existingRole = { id: 1, name: 'admin' } as Role;
      const permissions = [{ id: 1, action: 'read:users' }] as any;

      mockRoleRepository.findOneById.mockResolvedValue(existingRole);
      mockPermissionsRepository.findManyByActions.mockResolvedValue(
        permissions,
      );
      mockRoleRepository.save.mockResolvedValue({
        ...existingRole,
        name: 'superadmin',
        permissions,
      } as Role);

      const result = await service.update(1, dto);

      expect(result.name).toEqual('superadmin');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'role.updated',
        expect.any(Object),
      );
    });
  });

  describe('getUserPermissions', () => {
    it('should return permissions from cache if available', async () => {
      const cachedPermissions = ['read:news', 'create:news'];
      jest.spyOn(cacheService, 'get').mockReturnValue(cachedPermissions);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual(cachedPermissions);
      expect(cacheService.get).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
      );
      expect(usersService.findOneById).not.toHaveBeenCalled();
    });

    it('should query DB via UserCompanyRepository and cache permissions if not in cache', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);

      const mockUser = { id: 1 } as User;
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);
      mockUserCompanyRepository.findPermissionsByUserId.mockResolvedValue([
        'read:news',
        'create:news',
      ]);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual(['read:news', 'create:news']);
      expect(cacheService.get).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
      );
      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(
        mockUserCompanyRepository.findPermissionsByUserId,
      ).toHaveBeenCalledWith(1);
      expect(cacheService.set).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
        ['read:news', 'create:news'],
        3600,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);

      await expect(service.getUserPermissions(999)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
