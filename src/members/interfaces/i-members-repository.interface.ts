import { ApplyMemberDto, MemberQueryDto } from '../dto';
import { Member } from '../entities/member.entity';

export const MEMBERS_REPOSITORY = 'MEMBERS_REPOSITORY';

export interface IMembersRepository {
  findApproved(
    query: MemberQueryDto,
    companyId: number,
  ): Promise<[Member[], number]>;
  findFeatured(companyId: number): Promise<Member[]>;
  create(data: ApplyMemberDto): Promise<Member>;
  findAllAdmin(
    query: MemberQueryDto,
    companyId: number,
  ): Promise<[Member[], number]>;
  findById(id: string, companyId: number): Promise<Member | null>;
  save(member: Member): Promise<Member>;
}
