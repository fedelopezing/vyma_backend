import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MemberQueryDto, UpdateMemberDto } from './dto';
import { Member, MemberStatus } from './entities/member.entity';
import {
  IMembersRepository,
  MEMBERS_REPOSITORY,
} from './interfaces/i-members-repository.interface';
import { MemberNotFoundException } from './exceptions/member-not-found.exception';
import { MemberApplicationStatusChangedEvent } from './events/member-application.event';
import { buildPaginatedResponse } from '../common/helpers/pagination.helper';
import { PaginatedResponse } from '../common/interfaces';

@Injectable()
export class AdminMembersService {
  private readonly logger = new Logger(AdminMembersService.name);

  constructor(
    @Inject(MEMBERS_REPOSITORY)
    private readonly membersRepository: IMembersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    query: MemberQueryDto,
    companyId: number,
  ): Promise<PaginatedResponse<Member>> {
    try {
      const { page = 1, limit = 12 } = query;
      const [members, total] = await this.membersRepository.findAllAdmin(
        query,
        companyId,
      );

      return buildPaginatedResponse(members, total, page, limit);
    } catch (error) {
      this.logger.error(
        `Failed to find all members for company ${companyId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: MemberStatus,
    version: number | undefined,
    companyId: number,
  ): Promise<Member> {
    try {
      const member = await this.membersRepository.findById(id, companyId);
      if (!member) {
        throw new MemberNotFoundException(id);
      }

      if (version !== undefined && member.version !== version) {
        throw new ConflictException(
          'Optimistic locking failure: version mismatch',
        );
      }

      const oldStatus = member.status;
      member.status = status;
      const updatedMember = await this.membersRepository.save(member);

      if (oldStatus !== status) {
        this.eventEmitter.emit(
          'member.application.status-changed',
          new MemberApplicationStatusChangedEvent(updatedMember, status),
        );
      }

      return updatedMember;
    } catch (error) {
      this.logger.error(
        `Failed to update member status ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateFeatured(
    id: string,
    isFeatured: boolean,
    version: number | undefined,
    companyId: number,
  ): Promise<Member> {
    try {
      const member = await this.membersRepository.findById(id, companyId);
      if (!member) {
        throw new MemberNotFoundException(id);
      }

      if (version !== undefined && member.version !== version) {
        throw new ConflictException(
          'Optimistic locking failure: version mismatch',
        );
      }

      member.isFeatured = isFeatured;
      return await this.membersRepository.save(member);
    } catch (error) {
      this.logger.error(
        `Failed to update member featured status ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateMemberDto,
    companyId: number,
  ): Promise<Member> {
    try {
      const member = await this.membersRepository.findById(id, companyId);
      if (!member) {
        throw new MemberNotFoundException(id);
      }

      if (data.version !== undefined && member.version !== data.version) {
        throw new ConflictException(
          'Optimistic locking failure: version mismatch',
        );
      }

      Object.assign(member, data);
      return await this.membersRepository.save(member);
    } catch (error) {
      this.logger.error(
        `Failed to update member ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
