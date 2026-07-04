import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { News } from '../news/entities/news.entity';
import { Event } from '../events/entities/event.entity';
import { Company } from '../companies/entities/company.entity';
import { UserCompany } from '../companies/entities/user-company.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import {
  SEED_TABLES_ORDER,
  SEED_PERMISSIONS,
  SEED_ROLES_CONFIG,
  SeedPermission,
} from './data/roles.seed-data';
import { buildNewsSeedData } from './data/news.seed-data';
import { buildEventsSeedData } from './data/events.seed-data';
import { Member } from '../members/entities/member.entity';
import { buildMembersSeedData } from './data/members.seed-data';
import { Ad } from '../ads/entities/ad.entity';
import { buildAdsSeedData } from './data/ads.seed-data';

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

  async createCompanies(qr: QueryRunner): Promise<Record<string, Company>> {
    const ccps = qr.manager.create(Company, {
      name: 'CCPS',
      taxId: '111111111-1',
      email: 'ccps@mail.com',
      isActive: true,
    });
    const biolimpieza = qr.manager.create(Company, {
      name: 'biolimpieza',
      taxId: '222222222-2',
      email: 'biolimpieza@mail.com',
      isActive: true,
    });
    const natynails = qr.manager.create(Company, {
      name: 'natynails',
      taxId: '333333333-3',
      email: 'natynails@mail.com',
      isActive: true,
    });

    await qr.manager.save(ccps);
    await qr.manager.save(biolimpieza);
    await qr.manager.save(natynails);

    return {
      CCPS: ccps,
      biolimpieza: biolimpieza,
      natynails: natynails,
    };
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
      isSuperAdmin: true,
    });

    return qr.manager.save(user);
  }

  async createAdditionalUsers(
    qr: QueryRunner,
    rolesMap: Record<string, Role>,
    companiesMap: Record<string, Company>,
  ): Promise<void> {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. ccps@mail.com (Manager in CCPS)
    const ccpsUser = qr.manager.create(User, {
      email: 'ccps@mail.com',
      name: 'CCPS Manager',
      passwordHash,
      role: rolesMap[ValidRoles.manager],
      provider: 'local' as const,
      isActive: true,
    });
    await qr.manager.save(ccpsUser);

    const ccpsMembership = qr.manager.create(UserCompany, {
      userId: ccpsUser.id,
      companyId: companiesMap['CCPS'].id,
      roleId: rolesMap[ValidRoles.manager].id,
      isActive: true,
    });
    await qr.manager.save(ccpsMembership);

    // 2. fede@mail.com (Manager in biolimpieza and natynails)
    const fedeUser = qr.manager.create(User, {
      email: 'fede@mail.com',
      name: 'Fede Manager',
      passwordHash,
      role: rolesMap[ValidRoles.manager],
      provider: 'local' as const,
      isActive: true,
    });
    await qr.manager.save(fedeUser);

    const bioMembership = qr.manager.create(UserCompany, {
      userId: fedeUser.id,
      companyId: companiesMap['biolimpieza'].id,
      roleId: rolesMap[ValidRoles.manager].id,
      isActive: true,
    });
    await qr.manager.save(bioMembership);

    const natyMembership = qr.manager.create(UserCompany, {
      userId: fedeUser.id,
      companyId: companiesMap['natynails'].id,
      roleId: rolesMap[ValidRoles.manager].id,
      isActive: true,
    });
    await qr.manager.save(natyMembership);

    // 3. user@mail.com (User in biolimpieza)
    const regularUser = qr.manager.create(User, {
      email: 'user@mail.com',
      name: 'Regular User',
      passwordHash,
      role: rolesMap[ValidRoles.user],
      provider: 'local' as const,
      isActive: true,
    });
    await qr.manager.save(regularUser);

    const regularMembership = qr.manager.create(UserCompany, {
      userId: regularUser.id,
      companyId: companiesMap['biolimpieza'].id,
      roleId: rolesMap[ValidRoles.user].id,
      isActive: true,
    });
    await qr.manager.save(regularMembership);
  }

  async createNews(
    qr: QueryRunner,
    author: User,
    company: Company,
  ): Promise<void> {
    const newsItems = buildNewsSeedData(author);

    for (const data of newsItems) {
      const newsItem = qr.manager.create(News, {
        ...data,
        company,
      });
      await qr.manager.save(newsItem);
    }
  }

  async createEvents(
    qr: QueryRunner,
    author: User,
    company: Company,
  ): Promise<void> {
    const eventItems = buildEventsSeedData(author);

    for (const data of eventItems) {
      const eventItem = qr.manager.create(Event, {
        ...data,
        company,
      });
      await qr.manager.save(eventItem);
    }
  }

  async createMembers(
    qr: QueryRunner,
    companiesMap: Record<string, Company>,
  ): Promise<void> {
    const membersData = buildMembersSeedData(companiesMap);

    for (const data of membersData) {
      const member = qr.manager.create(Member, data);
      await qr.manager.save(member);
    }
  }

  async createAds(
    qr: QueryRunner,
    companiesMap: Record<string, Company>,
  ): Promise<void> {
    const adsData = buildAdsSeedData();

    for (const data of adsData) {
      const { companyKey, ...adDetails } = data;
      const company = companiesMap[companyKey];
      const ad = qr.manager.create(Ad, {
        ...adDetails,
        company,
      });
      await qr.manager.save(ad);
    }
  }
}
