import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCompanyRepository } from '../../companies/repositories/user-company.repository';
import { CacheService } from '../../common/services/cache.service';
import { RoleUpdatedEvent } from '../events/role-updated.event';
import { AuthCacheKeys } from '../constants/cache-keys.constant';
import { getErrorStack } from '../../common/helpers/errors.helper';

@Injectable()
export class RoleCacheListener {
  private readonly logger = new Logger(RoleCacheListener.name);

  constructor(
    private readonly userCompanyRepository: UserCompanyRepository,
    private readonly cacheService: CacheService,
  ) {}

  @OnEvent('role.updated')
  async handleRoleUpdatedEvent(event: RoleUpdatedEvent) {
    this.logger.log(`Handling role.updated event for roleId: ${event.roleId}`);
    try {
      const users = await this.userCompanyRepository.findUsersByRoleId(
        event.roleId,
      );

      for (const user of users) {
        const cacheKey = AuthCacheKeys.userPermissions(user.id);
        this.cacheService.delete(cacheKey);
        this.logger.debug(`Invalidated cache for user: ${user.id}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for roleId: ${event.roleId}`,
        getErrorStack(error),
      );
    }
  }
}
