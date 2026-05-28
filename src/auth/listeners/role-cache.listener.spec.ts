import { Test, TestingModule } from '@nestjs/testing';
import { RoleCacheListener } from './role-cache.listener';
import { UsersService } from '../../users/users.service';
import { CacheService } from '../../common/services/cache.service';
import { createMock } from '@golevelup/ts-jest';
import { RoleUpdatedEvent } from '../events/role-updated.event';
import { AuthCacheKeys } from '../constants/cache-keys.constant';

describe('RoleCacheListener', () => {
  let listener: RoleCacheListener;
  let usersService: jest.Mocked<UsersService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleCacheListener,
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

    listener = module.get<RoleCacheListener>(RoleCacheListener);
    usersService = module.get(UsersService);
    cacheService = module.get(CacheService);
  });

  it('should invalidate cache for all users with the updated role', async () => {
    const roleId = 1;
    const mockUsers = [{ id: 10 }, { id: 20 }];

    usersService.findUsersByRoleId.mockResolvedValue(
      mockUsers as unknown as { id: number }[],
    );

    await listener.handleRoleUpdatedEvent(new RoleUpdatedEvent(roleId));

    expect(usersService.findUsersByRoleId).toHaveBeenCalledWith(roleId);
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
    usersService.findUsersByRoleId.mockRejectedValue(new Error('DB Error'));

    await expect(
      listener.handleRoleUpdatedEvent(new RoleUpdatedEvent(roleId)),
    ).resolves.not.toThrow();
  });
});
