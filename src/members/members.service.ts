import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplyMemberDto, MemberQueryDto } from './dto';
import { Member } from './entities/member.entity';
import {
  IMembersRepository,
  MEMBERS_REPOSITORY,
} from './interfaces/i-members-repository.interface';
import { MemberApplicationReceivedEvent } from './events/member-application.event';
import { buildPaginatedResponse } from '../common/helpers/pagination.helper';
import { PaginatedResponse } from '../common/interfaces';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    @Inject(MEMBERS_REPOSITORY)
    private readonly membersRepository: IMembersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findApproved(
    query: MemberQueryDto,
    companyId: number,
  ): Promise<PaginatedResponse<Member>> {
    try {
      const { page = 1, limit = 12 } = query;
      const [members, total] = await this.membersRepository.findApproved(
        query,
        companyId,
      );

      return buildPaginatedResponse(members, total, page, limit);
    } catch (error) {
      this.logger.error(
        `Failed to find approved members for company ${companyId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findFeatured(companyId: number): Promise<Member[]> {
    try {
      return await this.membersRepository.findFeatured(companyId);
    } catch (error) {
      this.logger.error(
        `Failed to find featured members for company ${companyId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async apply(data: ApplyMemberDto): Promise<Member> {
    try {
      // ReCAPTCHA validation should ideally happen here or in a Guard/Interceptor
      // For now, we proceed to save assuming it's valid

      const member = await this.membersRepository.create(data);

      this.eventEmitter.emit(
        'member.application.received',
        new MemberApplicationReceivedEvent(member),
      );

      return member;
    } catch (error) {
      this.logger.error(
        `Failed to create member application: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
