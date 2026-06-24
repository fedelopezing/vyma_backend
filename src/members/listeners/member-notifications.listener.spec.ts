import { Test, TestingModule } from '@nestjs/testing';
import { MemberNotificationsListener } from './member-notifications.listener';
import { Member, MemberStatus, FeeType } from '../entities/member.entity';
import {
  MemberApplicationReceivedEvent,
  MemberApplicationStatusChangedEvent,
} from '../events/member-application.event';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';

describe('MemberNotificationsListener', () => {
  let listener: MemberNotificationsListener;

  const createFakeMember = (): Member => {
    const member = new Member();
    member.id = faker.string.uuid();
    member.companyId = 1;
    member.email = faker.internet.email();
    member.feeType = FeeType.ANNUAL;
    member.companyName = faker.company.name();
    member.taxId = faker.finance.routingNumber();
    member.address = faker.location.streetAddress();
    member.city = faker.location.city();
    member.country = faker.location.country();
    member.phone = faker.phone.number();
    member.category = faker.commerce.department();
    member.representativeName = faker.person.fullName();
    member.representativeEmail = faker.internet.email();
    member.representativePhone = faker.phone.number();
    member.isFeatured = false;
    member.status = MemberStatus.PENDING;
    member.version = 1;
    member.createdAt = new Date();
    member.updatedAt = new Date();
    return member;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberNotificationsListener],
    }).compile();

    listener = module.get<MemberNotificationsListener>(
      MemberNotificationsListener,
    );
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleMemberApplicationReceived', () => {
    it('should log and complete successfully', async () => {
      const fakeMember = createFakeMember();
      const event = new MemberApplicationReceivedEvent(fakeMember);

      const listenerWithLogger = listener as unknown as { logger: Logger };
      const logSpy = jest.spyOn(listenerWithLogger.logger, 'log');

      await expect(
        listener.handleMemberApplicationReceived(event),
      ).resolves.not.toThrow();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Handling member.application.received for member ${fakeMember.id}`,
        ),
      );
    });

    it('should catch error and log if something throws', async () => {
      const event = new MemberApplicationReceivedEvent(
        null as unknown as Member,
      );
      const listenerWithLogger = listener as unknown as { logger: Logger };
      const errorSpy = jest.spyOn(listenerWithLogger.logger, 'error');

      await expect(
        listener.handleMemberApplicationReceived(event),
      ).resolves.not.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('handleMemberApplicationStatusChanged', () => {
    it('should log and complete successfully', async () => {
      const fakeMember = createFakeMember();
      const event = new MemberApplicationStatusChangedEvent(
        fakeMember,
        MemberStatus.APPROVED,
      );

      const listenerWithLogger = listener as unknown as { logger: Logger };
      const logSpy = jest.spyOn(listenerWithLogger.logger, 'log');

      await expect(
        listener.handleMemberApplicationStatusChanged(event),
      ).resolves.not.toThrow();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Handling member.application.status-changed for member ${fakeMember.id} to status ${MemberStatus.APPROVED}`,
        ),
      );
    });

    it('should catch error and log if something throws', async () => {
      const event = new MemberApplicationStatusChangedEvent(
        null as unknown as Member,
        MemberStatus.APPROVED,
      );
      const listenerWithLogger = listener as unknown as { logger: Logger };
      const errorSpy = jest.spyOn(listenerWithLogger.logger, 'error');

      await expect(
        listener.handleMemberApplicationStatusChanged(event),
      ).resolves.not.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
