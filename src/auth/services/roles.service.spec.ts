import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { CacheService } from '../../common/services/cache.service';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { createMock } from '@golevelup/ts-jest';
import { AuthCacheKeys } from '../constants/cache-keys.constant';

describe('RolesService', () => {
  let service: RolesService;
  let usersService: UsersService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: createMock<Repository<Role>>(),
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
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
  });
});
