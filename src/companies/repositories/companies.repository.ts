import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource, DeepPartial } from 'typeorm';
import { Company } from '../entities/company.entity';
import { runInTransaction } from '../../common/helpers/transaction.helper';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  async runTransaction<T>(
    cb: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return runInTransaction(this.dataSource, (qr) => cb(qr.manager));
  }

  async create(
    company: DeepPartial<Company>,
    manager?: EntityManager,
  ): Promise<Company> {
    const repo = manager ? manager.getRepository(Company) : this.repository;
    const newCompany = repo.create(company);

    return repo.save(newCompany);
  }

  async findAll(): Promise<Company[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async findByUuid(uuid: string): Promise<Company | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  async findById(id: number): Promise<Company | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(
    id: number,
    data: DeepPartial<Company>,
    manager?: EntityManager,
  ): Promise<Company> {
    const repo = manager ? manager.getRepository(Company) : this.repository;
    await repo.update(id, data);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Company not found after update`);
    }
    return updated;
  }
}
