import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionNotFoundException } from './exceptions/permission-not-found.exception';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.findAll();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne(id);
    if (!permission) {
      throw new PermissionNotFoundException(id);
    }
    return permission;
  }
}
