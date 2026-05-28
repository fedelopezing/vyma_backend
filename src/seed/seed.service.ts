import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../auth/entities/role.entity';
import { Permission } from '../auth/entities/permission.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async executeSeed() {
    try {
      await this.seedPermissions();
      await this.seedRoles();
      await this.seedUsers();
      return { message: 'Seed executed successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error executing seed');
    }
  }

  private async seedPermissions() {
    const actions = [
      'create:news',
      'read:news',
      'update:news',
      'delete:news',
      'read:users',
      'write:users',
    ];

    for (const action of actions) {
      const exists = await this.permissionRepository.findOne({
        where: { action },
      });
      if (!exists) {
        const permission = this.permissionRepository.create({ action });
        await this.permissionRepository.save(permission);
      }
    }
  }

  private async seedRoles() {
    const allPermissions = await this.permissionRepository.find();
    const readNewsPerm = allPermissions.find((p) => p.action === 'read:news');
    const createNewsPerm = allPermissions.find(
      (p) => p.action === 'create:news',
    );
    const updateNewsPerm = allPermissions.find(
      (p) => p.action === 'update:news',
    );

    const rolesData = [
      {
        name: 'admin',
        permissions: allPermissions,
      },
      {
        name: 'professional',
        permissions: [readNewsPerm, createNewsPerm, updateNewsPerm].filter(
          Boolean,
        ) as Permission[],
      },
      {
        name: 'client',
        permissions: [readNewsPerm].filter(Boolean) as Permission[],
      },
    ];

    for (const roleData of rolesData) {
      const exists = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });
      if (!exists) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
      } else {
        exists.permissions = roleData.permissions;
        await this.roleRepository.save(exists);
      }
    }
  }

  private async seedUsers() {
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (adminRole) {
      const adminEmail = 'admin@mail.com';
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('Admin123!', 10);
        const adminUser = this.userRepository.create({
          email: adminEmail,
          name: 'Admin',
          passwordHash,
          role: adminRole,
        });
        await this.userRepository.save(adminUser);
      }
    }

    const usersWithoutRole = await this.userRepository.find({
      relations: ['role'],
    });

    for (const user of usersWithoutRole) {
      if (!user.role) {
        const clientRole = await this.roleRepository.findOne({
          where: { name: 'client' },
        });
        if (clientRole) {
          user.role = clientRole;
          await this.userRepository.save(user);
        }
      }
    }
  }
}
