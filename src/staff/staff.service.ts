import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IStaffRepository,
  STAFF_REPOSITORY,
} from './interfaces/i-staff-repository.interface';
import {
  CreateStaffMemberDto,
  UpdateStaffMemberDto,
  QueryStaffMemberDto,
  StaffMemberResponseDto,
  PaginatedStaffResponseDto,
} from './dto';
import { StaffMemberNotFoundException } from './exceptions/staff-member-not-found.exception';
import { StaffMemberDuplicateCiException } from './exceptions/staff-member-duplicate-ci.exception';
import { StaffStatus } from './constants/staff-enums';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: IStaffRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    query: QueryStaffMemberDto,
  ): Promise<PaginatedStaffResponseDto> {
    try {
      const [items, total] = await this.staffRepository.findAll(query);
      return {
        data: items.map((item) => new StaffMemberResponseDto(item)),
        total,
        page: query.page || 1,
        limit: query.limit || 20,
      };
    } catch (error) {
      this.logger.error(
        `Error finding staff members: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: number): Promise<StaffMemberResponseDto> {
    try {
      const staffMember = await this.staffRepository.findById(id);
      if (!staffMember) {
        throw new StaffMemberNotFoundException(id);
      }
      return new StaffMemberResponseDto(staffMember);
    } catch (error) {
      this.logger.error(
        `Error finding staff member ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(
    createDto: CreateStaffMemberDto,
    companyId: number,
  ): Promise<StaffMemberResponseDto> {
    try {
      // Check for duplicate National ID (Cédula) within the same company
      const existing = await this.staffRepository.findByNationalIdAndCompany(
        createDto.nationalId,
        companyId,
      );
      if (existing) {
        throw new StaffMemberDuplicateCiException(createDto.nationalId);
      }

      const newStaff = await this.staffRepository.create(createDto, companyId);

      this.eventEmitter.emit('staff.created', {
        staffId: newStaff.id,
        companyId: newStaff.companyId,
      });

      return new StaffMemberResponseDto(newStaff);
    } catch (error) {
      this.logger.error(
        `Error creating staff member: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateDto: UpdateStaffMemberDto,
    companyId: number,
  ): Promise<StaffMemberResponseDto> {
    try {
      const staffMember = await this.staffRepository.findById(id);
      if (!staffMember) {
        throw new StaffMemberNotFoundException(id);
      }

      // Check for duplicate National ID (Cédula) if updating nationalId
      if (
        updateDto.nationalId &&
        updateDto.nationalId !== staffMember.nationalId
      ) {
        const existing = await this.staffRepository.findByNationalIdAndCompany(
          updateDto.nationalId,
          companyId,
        );
        if (existing) {
          throw new StaffMemberDuplicateCiException(updateDto.nationalId);
        }
      }

      const updated = await this.staffRepository.update(id, updateDto);

      this.eventEmitter.emit('staff.updated', {
        staffId: updated.id,
        companyId: updated.companyId,
      });

      return new StaffMemberResponseDto(updated);
    } catch (error) {
      this.logger.error(
        `Error updating staff member ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async changeStatus(
    id: number,
    status: StaffStatus,
  ): Promise<StaffMemberResponseDto> {
    try {
      const staffMember = await this.staffRepository.findById(id);
      if (!staffMember) {
        throw new StaffMemberNotFoundException(id);
      }

      const updated = await this.staffRepository.update(id, { status });

      this.eventEmitter.emit('staff.status_changed', {
        staffId: updated.id,
        companyId: updated.companyId,
        oldStatus: staffMember.status,
        newStatus: updated.status,
      });

      return new StaffMemberResponseDto(updated);
    } catch (error) {
      this.logger.error(
        `Error changing status for staff member ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const staffMember = await this.staffRepository.findById(id);
      if (!staffMember) {
        throw new StaffMemberNotFoundException(id);
      }

      // We perform a logical delete by changing status to TERMINATED and optionally isActive = false (done in repo)
      await this.staffRepository.remove(id);

      this.eventEmitter.emit('staff.deleted', {
        staffId: id,
        companyId: staffMember.companyId,
      });
    } catch (error) {
      this.logger.error(
        `Error removing staff member ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
