import { Test, TestingModule } from '@nestjs/testing';
import { RoleCacheListener } from './role-cache.listener';
import { UserCompanyRepository } from '../../companies/repositories/user-company.repository';
import { CacheService } from '../../common/services/cache.service';
import { createMock } from '@golevelup/ts-jest';
import { RoleUpdatedEvent } from '../events/role-updated.event';
import { AuthCacheKeys } from '../constants/cache-keys.constant';

describe('RoleCacheListener', () => {
  let listener: RoleCacheListener;
  let userCompanyRepository: jest.Mocked<UserCompanyRepository>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleCacheListener,
        {
          provide: UserCompanyRepository,
          useValue: createMock<UserCompanyRepository>(),
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
        },
      ],
    }).compile();

    listener = module.get<RoleCacheListener>(RoleCacheListener);
    userCompanyRepository = module.get(UserCompanyRepository);
    cacheService = module.get(CacheService);
  });

  it('should invalidate cache for all users with the updated role', async () => {
    const roleId = 1;
    const mockUsers = [{ id: 10 }, { id: 20 }];

    userCompanyRepository.findUsersByRoleId.mockResolvedValue(
      mockUsers as unknown as { id: number }[],
    );

    await listener.handleRoleUpdatedEvent(new RoleUpdatedEvent(roleId));

    expect(userCompanyRepository.findUsersByRoleId).toHaveBeenCalledWith(
      roleId,
    );
    expect(cacheService.delete).toHaveBeenCalledTimes(2);
    expect(cacheService.delete).toHaveBeenCalledWith(
      AuthCacheKeys.userPermissions(10),
    );
    expect(cacheService.delete).toHaveBeenCalledWith(
      AuthCacheKeys.userPermissions(20),
    );
  });

  it('should catch errors and not throw', async () => {
    const roleId = 1;
    userCompanyRepository.findUsersByRoleId.mockRejectedValue(
      new Error('DB Error'),
    );

    await expect(
      listener.handleRoleUpdatedEvent(new RoleUpdatedEvent(roleId)),
    ).resolves.not.toThrow();
  });
});
