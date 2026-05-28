import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UsersService } from '../../users/users.service';
import { CacheService } from '../../common/services/cache.service';
import { AuthCacheKeys } from '../constants/cache-keys.constant';
import { RoleNotFoundException } from '../exceptions/role-not-found.exception';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return role;
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const cacheKey = AuthCacheKeys.userPermissions(userId);
    const cachedPermissions = this.cacheService.get<string[]>(cacheKey);

    if (cachedPermissions) {
      return cachedPermissions;
    }

    const user = await this.usersService.findOneWithPermissions(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const permissions = user.role?.permissions?.map((p) => p.action) || [];

    // Set cache with TTL of 1 hour (3600 seconds)
    this.cacheService.set(cacheKey, permissions, 3600);

    return permissions;
  }
}
