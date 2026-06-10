import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { News } from '../news/entities/news.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import {
  SEED_TABLES_ORDER,
  SEED_PERMISSIONS,
  SEED_ROLES_CONFIG,
  SeedPermission,
} from './data/roles.seed-data';
import { buildNewsSeedData } from './data/news.seed-data';

@Injectable()
export class SeedRepository {
  constructor(private readonly dataSource: DataSource) {}

  createQueryRunner(): QueryRunner {
    return this.dataSource.createQueryRunner();
  }

  async truncateAllTables(qr: QueryRunner): Promise<void> {
    for (const table of SEED_TABLES_ORDER) {
      await qr.manager.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }

  async createPermissions(
    qr: QueryRunner,
  ): Promise<Record<SeedPermission, Permission>> {
    const map = {} as Record<SeedPermission, Permission>;

    for (const action of SEED_PERMISSIONS) {
      const permission = qr.manager.create(Permission, { action });
      await qr.manager.save(permission);
      map[action] = permission;
    }

    return map;
  }

  async createRoles(
    qr: QueryRunner,
    permissionsMap: Record<SeedPermission, Permission>,
  ): Promise<Record<string, Role>> {
    const rolesMap: Record<string, Role> = {};

    for (const config of SEED_ROLES_CONFIG) {
      const permissions = config.permissions.map((p) => permissionsMap[p]);
      const role = qr.manager.create(Role, { name: config.name, permissions });
      await qr.manager.save(role);
      rolesMap[config.name] = role;
    }

    return rolesMap;
  }

  async createAdminUser(
    qr: QueryRunner,
    rolesMap: Record<string, Role>,
  ): Promise<User> {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const user = qr.manager.create(User, {
      email: 'admin@mail.com',
      name: 'System Admin',
      passwordHash,
      role: rolesMap[ValidRoles.admin],
      provider: 'local' as const,
      isActive: true,
    });

    return qr.manager.save(user);
  }

  async createNews(qr: QueryRunner, author: User): Promise<void> {
    const newsItems = buildNewsSeedData(author);

    for (const data of newsItems) {
      const newsItem = qr.manager.create(News, data);
      await qr.manager.save(newsItem);
    }
  }
}
