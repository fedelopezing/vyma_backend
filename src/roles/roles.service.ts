import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersService } from '../users/users.service';
import { CacheService } from '../common/services/cache.service';
import { AuthCacheKeys } from '../auth/constants/cache-keys.constant';
import { RoleNotFoundException } from './exceptions/role-not-found.exception';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoleUpdatedEvent } from '../auth/events/role-updated.event';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
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

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...roleData } = createRoleDto;
    const role = this.roleRepository.create(roleData);

    if (permissions && permissions.length > 0) {
      const perms = await this.roleRepository.manager.find(Permission, {
        where: { action: In(permissions) },
      });
      role.permissions = perms;
    }

    return this.roleRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    const { permissions, ...roleData } = updateRoleDto;

    Object.assign(role, roleData);

    if (permissions) {
      const perms = await this.roleRepository.manager.find(Permission, {
        where: { action: In(permissions) },
      });
      role.permissions = perms;
    }

    const savedRole = await this.roleRepository.save(role);
    this.eventEmitter.emit('role.updated', new RoleUpdatedEvent(savedRole.id));

    return savedRole;
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
