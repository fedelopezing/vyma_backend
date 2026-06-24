import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MembersService } from './members.service';
import { MEMBERS_REPOSITORY } from './interfaces/i-members-repository.interface';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Member, MemberStatus, FeeType } from './entities/member.entity';
import { IMembersRepository } from './interfaces/i-members-repository.interface';
import { ApplyMemberDto, MemberQueryDto } from './dto';

describe('MembersService', () => {
  let service: MembersService;
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
    member.status = MemberStatus.APPROVED;
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
        MembersService,
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

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findApproved', () => {
    it('should return a paginated response of approved members', async () => {
      const query: MemberQueryDto = { page: 1, limit: 12 };
      const companyId = 1;
      const fakeMembers = [createFakeMember(), createFakeMember()];
      const total = 2;

      mockRepository.findApproved.mockResolvedValue([fakeMembers, total]);

      const result = await service.findApproved(query, companyId);

      expect(result).toBeDefined();
      expect(result.data).toEqual(fakeMembers);
      expect(result.meta.total).toBe(total);
      expect(mockRepository.findApproved).toHaveBeenCalledWith(
        query,
        companyId,
      );
    });

    it('should throw and log if repository fails', async () => {
      const query: MemberQueryDto = { page: 1, limit: 12 };
      const companyId = 1;
      const dbError = new Error('Database connection failed');

      mockRepository.findApproved.mockRejectedValue(dbError);

      await expect(service.findApproved(query, companyId)).rejects.toThrow(
        dbError,
      );
    });
  });

  describe('findFeatured', () => {
    it('should return featured members', async () => {
      const companyId = 1;
      const fakeFeatured = [createFakeMember()];
      mockRepository.findFeatured.mockResolvedValue(fakeFeatured);

      const result = await service.findFeatured(companyId);

      expect(result).toEqual(fakeFeatured);
      expect(mockRepository.findFeatured).toHaveBeenCalledWith(companyId);
    });

    it('should throw if repository fails', async () => {
      const companyId = 1;
      const dbError = new Error('Database error');
      mockRepository.findFeatured.mockRejectedValue(dbError);

      await expect(service.findFeatured(companyId)).rejects.toThrow(dbError);
    });
  });

  describe('apply', () => {
    it('should successfully create application and emit event', async () => {
      const dto: ApplyMemberDto = {
        companyId: 1,
        email: 'test@company.com',
        feeType: FeeType.ANNUAL,
        companyName: 'Test Corp',
        taxId: '123456',
        address: '123 St',
        city: 'Asuncion',
        country: 'Paraguay',
        phone: '123456',
        category: 'IT',
        representativeName: 'Rep',
        representativeEmail: 'rep@company.com',
        representativePhone: '123456',
        recaptchaToken: 'token',
      };

      const fakeMember = createFakeMember();
      fakeMember.status = MemberStatus.PENDING;
      mockRepository.create.mockResolvedValue(fakeMember);

      const result = await service.apply(dto);

      expect(result).toEqual(fakeMember);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'member.application.received',
        expect.any(Object),
      );
    });

    it('should throw if create fails', async () => {
      const dto: ApplyMemberDto = {
        companyId: 1,
        email: 'test@company.com',
        feeType: FeeType.ANNUAL,
        companyName: 'Test Corp',
        taxId: '123456',
        address: '123 St',
        city: 'Asuncion',
        country: 'Paraguay',
        phone: '123456',
        category: 'IT',
        representativeName: 'Rep',
        representativeEmail: 'rep@company.com',
        representativePhone: '123456',
        recaptchaToken: 'token',
      };

      const dbError = new Error('Insert failed');
      mockRepository.create.mockRejectedValue(dbError);

      await expect(service.apply(dto)).rejects.toThrow(dbError);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
