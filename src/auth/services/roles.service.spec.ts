import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { CacheService } from '../../common/services/cache.service';
import { NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('RolesService', () => {
  let service: RolesService;
  let userRepository: Repository<User>;
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
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
      expect(cacheService.get).toHaveBeenCalledWith('permissions_user_1');
      expect(userRepository.findOne).not.toHaveBeenCalled();
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

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual(['read:news', 'create:news']);
      expect(cacheService.get).toHaveBeenCalledWith('permissions_user_1');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['role', 'role.permissions'],
        select: {
          id: true,
          role: {
            id: true,
            permissions: {
              action: true,
            },
          },
        },
      });
      expect(cacheService.set).toHaveBeenCalledWith(
        'permissions_user_1',
        ['read:news', 'create:news'],
        3600,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(cacheService, 'get').mockReturnValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserPermissions(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
