import { StaffMember } from '../entities/staff-member.entity';
import {
  CreateStaffMemberDto,
  UpdateStaffMemberDto,
  QueryStaffMemberDto,
} from '../dto';

export const STAFF_REPOSITORY = 'STAFF_REPOSITORY';

export interface IStaffRepository {
  findAll(query: QueryStaffMemberDto): Promise<[StaffMember[], number]>;
  findById(id: number, companyId?: number): Promise<StaffMember | null>;
  findByNationalIdAndCompany(
    nationalId: string,
    companyId: number,
  ): Promise<StaffMember | null>;
  create(data: CreateStaffMemberDto, companyId: number): Promise<StaffMember>;
  update(id: number, data: Partial<StaffMember>): Promise<StaffMember>;
  remove(id: number): Promise<void>;
}
