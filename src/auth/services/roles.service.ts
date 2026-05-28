import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const cacheKey = `permissions_user_${userId}`;
    const cachedPermissions = this.cacheService.get<string[]>(cacheKey);

    if (cachedPermissions) {
      return cachedPermissions;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
      select: {
        id: true, // Requerido para resolver la relación
        role: {
          id: true,
          permissions: {
            action: true, // Solo traemos el string de la acción
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const permissions = user.role?.permissions?.map((p) => p.action) || [];

    // Set cache with TTL of 1 hour (3600 seconds)
    this.cacheService.set(cacheKey, permissions, 3600);

    return permissions;
  }
}
