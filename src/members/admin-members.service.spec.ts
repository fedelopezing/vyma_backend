import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';
import { AdminMembersService } from './admin-members.service';
import { MEMBERS_REPOSITORY } from './interfaces/i-members-repository.interface';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Member, MemberStatus, FeeType } from './entities/member.entity';
import { IMembersRepository } from './interfaces/i-members-repository.interface';
import { MemberNotFoundException } from './exceptions/member-not-found.exception';
import { MemberQueryDto, UpdateMemberDto } from './dto';

describe('AdminMembersService', () => {
  let service: AdminMembersService;
  let mockRepository: DeepMocked<IMembersRepository>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  const createFakeMember = (): Member => {
    const member = new Member();
    member.id = faker.string.uuid();
    member.companyId = faker.number.int({ min: 1, max: 100 });
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
    mockRepository = createMock<IMembersRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminMembersService,
        {
          provide: MEMBERS_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AdminMembersService>(AdminMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated members for admin', async () => {
      const query: MemberQueryDto = { page: 1, limit: 12 };
      const companyId = 1;
      const fakeMembers = [createFakeMember()];
      const total = 1;

      mockRepository.findAllAdmin.mockResolvedValue([fakeMembers, total]);

      const result = await service.findAll(query, companyId);

      expect(result).toBeDefined();
      expect(result.data).toEqual(fakeMembers);
      expect(result.meta.total).toBe(total);
      expect(mockRepository.findAllAdmin).toHaveBeenCalledWith(
        query,
        companyId,
      );
    });

    it('should throw if repository fails', async () => {
      mockRepository.findAllAdmin.mockRejectedValue(
        new Error('Repository failed'),
      );
      await expect(service.findAll({}, 1)).rejects.toThrow('Repository failed');
    });
  });

  describe('updateStatus', () => {
    it('should update status and emit event if status changed', async () => {
      const fakeMember = createFakeMember();
      const companyId = fakeMember.companyId;
      mockRepository.findById.mockResolvedValue(fakeMember);
      mockRepository.save.mockResolvedValue({
        ...fakeMember,
        status: MemberStatus.APPROVED,
      });

      const result = await service.updateStatus(
        fakeMember.id,
        MemberStatus.APPROVED,
        1,
        companyId,
      );

      expect(result.status).toBe(MemberStatus.APPROVED);
      expect(mockRepository.findById).toHaveBeenCalledWith(
        fakeMember.id,
        companyId,
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'member.application.status-changed',
        expect.any(Object),
      );
    });

    it('should update status but not emit event if status is unchanged', async () => {
      const fakeMember = createFakeMember();
      const companyId = fakeMember.companyId;
      mockRepository.findById.mockResolvedValue(fakeMember);
      mockRepository.save.mockResolvedValue(fakeMember);

      const result = await service.updateStatus(
        fakeMember.id,
        MemberStatus.PENDING,
        1,
        companyId,
      );

      expect(result.status).toBe(MemberStatus.PENDING);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw MemberNotFoundException if member does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('invalid-id', MemberStatus.APPROVED, 1, 1),
      ).rejects.toThrow(MemberNotFoundException);
    });

    it('should throw ConflictException on version mismatch', async () => {
      const fakeMember = createFakeMember();
      fakeMember.version = 2;
      mockRepository.findById.mockResolvedValue(fakeMember);

      await expect(
        service.updateStatus(
          fakeMember.id,
          MemberStatus.APPROVED,
          1,
          fakeMember.companyId,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateFeatured', () => {
    it('should update featured status successfully', async () => {
      const fakeMember = createFakeMember();
      mockRepository.findById.mockResolvedValue(fakeMember);
      mockRepository.save.mockResolvedValue({
        ...fakeMember,
        isFeatured: true,
      });

      const result = await service.updateFeatured(
        fakeMember.id,
        true,
        1,
        fakeMember.companyId,
      );

      expect(result.isFeatured).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(
        fakeMember.id,
        fakeMember.companyId,
      );
    });

    it('should throw MemberNotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(
        service.updateFeatured('invalid-id', true, 1, 1),
      ).rejects.toThrow(MemberNotFoundException);
    });

    it('should throw ConflictException on version mismatch', async () => {
      const fakeMember = createFakeMember();
      fakeMember.version = 5;
      mockRepository.findById.mockResolvedValue(fakeMember);

      await expect(
        service.updateFeatured(fakeMember.id, true, 1, fakeMember.companyId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update general member fields successfully', async () => {
      const fakeMember = createFakeMember();
      const dto: UpdateMemberDto = {
        companyName: 'Updated Name',
        version: 1,
      };

      mockRepository.findById.mockResolvedValue(fakeMember);
      mockRepository.save.mockResolvedValue({
        ...fakeMember,
        companyName: 'Updated Name',
      });

      const result = await service.update(
        fakeMember.id,
        dto,
        fakeMember.companyId,
      );

      expect(result.companyName).toBe('Updated Name');
      expect(mockRepository.findById).toHaveBeenCalledWith(
        fakeMember.id,
        fakeMember.companyId,
      );
    });

    it('should throw MemberNotFoundException if member not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.update('invalid-id', {}, 1)).rejects.toThrow(
        MemberNotFoundException,
      );
    });

    it('should throw ConflictException on version mismatch', async () => {
      const fakeMember = createFakeMember();
      fakeMember.version = 10;
      mockRepository.findById.mockResolvedValue(fakeMember);

      await expect(
        service.update(fakeMember.id, { version: 1 }, fakeMember.companyId),
      ).rejects.toThrow(ConflictException);
    });
  });
});
