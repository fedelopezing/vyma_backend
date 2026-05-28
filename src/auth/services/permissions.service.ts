import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionNotFoundException } from '../exceptions/permission-not-found.exception';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new PermissionNotFoundException(id);
    }
    return permission;
  }
}
