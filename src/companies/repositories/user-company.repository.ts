import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { UserCompany } from '../entities/user-company.entity';
import { runInTransaction } from '../../common/helpers/transaction.helper';

@Injectable()
export class UserCompanyRepository {
  constructor(
    @InjectRepository(UserCompany)
    private readonly repository: Repository<UserCompany>,
    private readonly dataSource: DataSource,
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
    const count = await this.repository.count({
      where: {
        userId,
        companyId,
        isActive: true,
      },
    });
    return count > 0;
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

    return repo.save(membership);
  }

  async removeMember(
    userId: number,
    companyId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(UserCompany) : this.repository;
    await repo.delete({ userId, companyId });
  }
}
