import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource, DeepPartial } from 'typeorm';
import { Company } from '../entities/company.entity';
import { runInTransaction } from '../../common/helpers/transaction.helper';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
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
    const cacheKey = `company:uuid:${uuid}`;
    const cached = this.cacheService.get<Company>(cacheKey);
    if (cached) {
      return cached;
    }

    const company = await this.repository.findOne({ where: { uuid } });
    if (company) {
      this.cacheService.set(cacheKey, company, 600);
    }
    return company;
  }

  async findById(id: number): Promise<Company | null> {
    const cacheKey = `company:id:${id}`;
    const cached = this.cacheService.get<Company>(cacheKey);
    if (cached) {
      return cached;
    }

    const company = await this.repository.findOne({ where: { id } });
    if (company) {
      this.cacheService.set(cacheKey, company, 600);
    }
    return company;
  }

  async update(
    id: number,
    data: DeepPartial<Company>,
    manager?: EntityManager,
  ): Promise<Company> {
    const repo = manager ? manager.getRepository(Company) : this.repository;
    const current = await this.findById(id);

    await repo.update(id, data);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Company not found after update`);
    }

    // Invalidar caché
    this.cacheService.delete(`company:id:${id}`);
    if (current?.uuid) {
      this.cacheService.delete(`company:uuid:${current.uuid}`);
    }

    return updated;
  }
}
