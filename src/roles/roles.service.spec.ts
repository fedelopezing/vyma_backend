import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleRepository: DeepMocked<Repository<Role>>;
  let usersService: UsersService;
  let cacheService: CacheService;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  beforeEach(async () => {
    mockRoleRepository = createMock<Repository<Role>>();
    mockEventEmitter = createMock<EventEmitter2>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
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
      mockRoleRepository.find.mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.find).toHaveBeenCalledWith({
        relations: ['permissions'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const mockRole = { id: 1, name: 'admin', permissions: [] } as Role;
      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['permissions'],
      });
    });

    it('should throw RoleNotFoundException if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(RoleNotFoundException);
    });
  });

  describe('remove', () => {
    it('should find and remove a role', async () => {
      const mockRole = { id: 1, name: 'admin', permissions: [] } as Role;
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.remove.mockResolvedValue(mockRole);

      await service.remove(1);

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['permissions'],
      });
      expect(mockRoleRepository.remove).toHaveBeenCalledWith(mockRole);
    });
  });

  describe('create', () => {
    it('should create a role without permissions', async () => {
      const createRoleDto = { name: 'editor' };
      const expectedRole = { id: 2, name: 'editor' } as Role;

      mockRoleRepository.create.mockReturnValue(expectedRole);
      mockRoleRepository.save.mockResolvedValue(expectedRole);

      const result = await service.create(createRoleDto);

      expect(result).toEqual(expectedRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith(createRoleDto);
      expect(mockRoleRepository.save).toHaveBeenCalledWith(expectedRole);
    });
  });

  describe('update', () => {
    it('should update a role and emit role.updated event', async () => {
      const existingRole = { id: 1, name: 'admin', permissions: [] } as Role;
      const updateRoleDto = { name: 'superadmin' };
      const updatedRole = {
        id: 1,
        name: 'superadmin',
        permissions: [],
      } as Role;

      mockRoleRepository.findOne.mockResolvedValue(existingRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.update(1, updateRoleDto);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['permissions'],
      });
      expect(mockRoleRepository.save).toHaveBeenCalledWith(existingRole);
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
      expect(usersService.findOneWithPermissions).not.toHaveBeenCalled();
    });

    it('should query DB and cache permissions if not in cache', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);

      const mockUser = {
        id: 1,
        role: {
          id: 1,
          name: 'admin',
          permissions: [
            { id: 1, action: 'read:news' },
            { id: 2, action: 'create:news' },
          ],
        },
      } as User;

      jest
        .spyOn(usersService, 'findOneWithPermissions')
        .mockResolvedValue(mockUser);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual(['read:news', 'create:news']);
      expect(cacheService.get).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
      );
      expect(usersService.findOneWithPermissions).toHaveBeenCalledWith(1);
      expect(cacheService.set).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
        ['read:news', 'create:news'],
        3600,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);
      jest
        .spyOn(usersService, 'findOneWithPermissions')
        .mockResolvedValue(null);

      await expect(service.getUserPermissions(999)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should return empty array if user has no role', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);
      const mockUser = {
        id: 1,
        role: null,
      } as User;
      jest
        .spyOn(usersService, 'findOneWithPermissions')
        .mockResolvedValue(mockUser);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual([]);
      expect(cacheService.set).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
        [],
        3600,
      );
    });

    it('should return empty array if user role has no permissions', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);
      const mockUser = {
        id: 1,
        role: {
          id: 1,
          name: 'user',
          permissions: null,
        },
      } as User;
      jest
        .spyOn(usersService, 'findOneWithPermissions')
        .mockResolvedValue(mockUser);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual([]);
      expect(cacheService.set).toHaveBeenCalledWith(
        AuthCacheKeys.userPermissions(1),
        [],
        3600,
      );
    });
  });
});
