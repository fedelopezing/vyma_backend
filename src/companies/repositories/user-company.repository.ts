import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { UserCompany } from '../entities/user-company.entity';
import { runInTransaction } from '../../common/helpers/transaction.helper';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class UserCompanyRepository {
  constructor(
    @InjectRepository(UserCompany)
    private readonly repository: Repository<UserCompany>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  async runTransaction<T>(
    cb: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return runInTransaction(this.dataSource, (qr) => cb(qr.manager));
  }

  async findMembershipsByUserId(userId: number): Promise<UserCompany[]> {
    return this.repository.find({
      where: { userId },
      relations: ['company', 'role'],
      order: { company: { name: 'ASC' } },
    });
  }

  async isActiveMember(userId: number, companyId: number): Promise<boolean> {
    const cacheKey = `company:membership:${userId}:${companyId}`;
    const cached = this.cacheService.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const count = await this.repository.count({
      where: {
        userId,
        companyId,
        isActive: true,
      },
    });
    const isActive = count > 0;
    this.cacheService.set(cacheKey, isActive, 300);
    return isActive;
  }

  async addMember(
    userId: number,
    companyId: number,
    roleId: number,
    manager?: EntityManager,
  ): Promise<UserCompany> {
    const repo = manager ? manager.getRepository(UserCompany) : this.repository;
    const membership = repo.create({
      userId,
      companyId,
      roleId,
      isActive: true,
    });

    const saved = await repo.save(membership);
    this.cacheService.delete(`company:membership:${userId}:${companyId}`);
    return saved;
  }

  async removeMember(
    userId: number,
    companyId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(UserCompany) : this.repository;
    await repo.delete({ userId, companyId });
    this.cacheService.delete(`company:membership:${userId}:${companyId}`);
  }
}
