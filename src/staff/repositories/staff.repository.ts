import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { StaffMember } from '../entities/staff-member.entity';
import { IStaffRepository } from '../interfaces/i-staff-repository.interface';
import {
  CreateStaffMemberDto,
  UpdateStaffMemberDto,
  QueryStaffMemberDto,
} from '../dto';

@Injectable()
export class StaffRepository implements IStaffRepository {
  constructor(
    @InjectRepository(StaffMember)
    private readonly repo: Repository<StaffMember>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: QueryStaffMemberDto): Promise<[StaffMember[], number]> {
    const { page = 1, limit = 20, companyId, search, status, position } = query;
    const qb = this.repo.createQueryBuilder('staff');

    // Filter by mandatory company context for admin/manager
    if (companyId) {
      qb.andWhere('staff.companyId = :companyId', { companyId });
    }

    if (search) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        `(
          unaccent(staff.firstName) ILIKE unaccent(:term) OR
          unaccent(staff.lastName) ILIKE unaccent(:term) OR
          unaccent(CONCAT(staff.firstName, ' ', staff.lastName)) ILIKE unaccent(:term) OR
          unaccent(CONCAT(staff.lastName, ' ', staff.firstName)) ILIKE unaccent(:term) OR
          staff.nationalId ILIKE :term
        )`,
        { term },
      );
    }

    if (status) {
      qb.andWhere('staff.status = :status', { status });
    }

    if (position) {
      qb.andWhere('staff.position = :position', { position });
    }

    qb.orderBy('staff.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  async findById(id: number, companyId?: number): Promise<StaffMember | null> {
    const where: FindOptionsWhere<StaffMember> = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    return this.repo.findOne({ where });
  }

  async findByNationalIdAndCompany(
    nationalId: string,
    companyId: number,
  ): Promise<StaffMember | null> {
    return this.repo.findOne({ where: { nationalId, companyId } });
  }

  async create(
    data: CreateStaffMemberDto,
    companyId: number,
  ): Promise<StaffMember> {
    const staff = this.repo.create({ ...data, companyId });
    return this.repo.save(staff);
  }

  async update(id: number, data: Partial<StaffMember>): Promise<StaffMember> {
    await this.repo.update(id, data);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
