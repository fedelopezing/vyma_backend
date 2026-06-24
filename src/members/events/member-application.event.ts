import { Member, MemberStatus } from '../entities/member.entity';

export class MemberApplicationReceivedEvent {
  constructor(public readonly member: Member) {}
}

export class MemberApplicationStatusChangedEvent {
  constructor(
    public readonly member: Member,
    public readonly newStatus: MemberStatus,
  ) {}
}
