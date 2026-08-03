import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
      qb.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.nationalId ILIKE :search)',
        { search: `%${search}%` },
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

  async findById(id: number): Promise<StaffMember | null> {
    return this.repo.findOne({ where: { id } });
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

  async update(id: number, data: UpdateStaffMemberDto): Promise<StaffMember> {
    await this.repo.update(id, data);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
