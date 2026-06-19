import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplyMemberDto, MemberQueryDto } from '../dto';
import { Member, MemberStatus } from '../entities/member.entity';
import { IMembersRepository } from '../interfaces/i-members-repository.interface';

@Injectable()
export class MembersRepository implements IMembersRepository {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
  ) {}

  async findApproved(
    query: MemberQueryDto,
    companyId: number,
  ): Promise<[Member[], number]> {
    const { page = 1, limit = 12, q, category } = query;
    const qb = this.repo.createQueryBuilder('member');

    qb.where('member.company_id = :companyId', { companyId }).andWhere(
      'member.status = :status',
      { status: MemberStatus.APPROVED },
    );

    if (q) {
      qb.andWhere('member.company_name ILIKE :q', { q: `%${q}%` });
    }

    if (category) {
      qb.andWhere('member.category = :category', { category });
    }

    qb.orderBy('member.is_featured', 'DESC')
      .addOrderBy('member.company_name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  async findFeatured(companyId: number): Promise<Member[]> {
    return this.repo.find({
      where: {
        companyId,
        status: MemberStatus.APPROVED,
        isFeatured: true,
      },
      order: {
        companyName: 'ASC',
      },
    });
  }

  async create(data: ApplyMemberDto): Promise<Member> {
    const member = this.repo.create(data);
    return this.repo.save(member);
  }

  async findAllAdmin(
    query: MemberQueryDto,
    companyId: number,
  ): Promise<[Member[], number]> {
    const { page = 1, limit = 12, q, status, category } = query;
    const qb = this.repo.createQueryBuilder('member');

    qb.where('member.company_id = :companyId', { companyId });

    if (status) {
      qb.andWhere('member.status = :status', { status });
    }

    if (q) {
      qb.andWhere('member.company_name ILIKE :q', { q: `%${q}%` });
    }

    if (category) {
      qb.andWhere('member.category = :category', { category });
    }

    qb.orderBy('member.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  async findById(id: string, companyId: number): Promise<Member | null> {
    return this.repo.findOne({ where: { id, companyId } });
  }

  async save(member: Member): Promise<Member> {
    return this.repo.save(member);
  }
}
