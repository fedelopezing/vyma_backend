import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Member, MemberStatus, FeeType } from './entities/member.entity';
import { MemberResponseDto, ApplyMemberDto } from './dto';

import { CompaniesRepository } from '../companies/repositories/companies.repository';

describe('MembersController', () => {
  let controller: MembersController;
  let mockService: DeepMocked<MembersService>;

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
    member.status = MemberStatus.APPROVED;
    member.version = 1;
    member.createdAt = new Date();
    member.updatedAt = new Date();
    return member;
  };

  beforeEach(async () => {
    mockService = createMock<MembersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockService,
        },
        {
          provide: CompaniesRepository,
          useValue: {
            findByUuid: jest.fn().mockResolvedValue({ id: 1, isActive: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllApproved', () => {
    it('should return mapped approved members response', async () => {
      const companyUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const companyId = 1;
      const fakeMembers = [createFakeMember(), createFakeMember()];
      const serviceResult = {
        data: fakeMembers,
        meta: {
          page: 1,
          limit: 12,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockService.findApproved.mockResolvedValue(serviceResult);

      const result = await controller.findAllApproved(companyUuid, {
        page: 1,
        limit: 12,
      });

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual(
        MemberResponseDto.fromEntity(fakeMembers[0]),
      );
      expect(mockService.findApproved).toHaveBeenCalledWith(
        { page: 1, limit: 12 },
        companyId,
      );
    });
  });

  describe('findFeatured', () => {
    it('should return mapped featured members', async () => {
      const companyUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const companyId = 1;
      const fakeFeatured = [createFakeMember()];
      mockService.findFeatured.mockResolvedValue(fakeFeatured);

      const result = await controller.findFeatured(companyUuid);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(MemberResponseDto.fromEntity(fakeFeatured[0]));
      expect(mockService.findFeatured).toHaveBeenCalledWith(companyId);
    });
  });

  describe('apply', () => {
    it('should submit application and return mapped DTO', async () => {
      const dto: ApplyMemberDto = {
        companyId: 1,
        email: 'info@company.com',
        feeType: FeeType.ANNUAL,
        companyName: 'Company Name',
        taxId: '12345',
        address: '123 Main St',
        city: 'Asuncion',
        country: 'Paraguay',
        phone: '12345',
        category: 'IT',
        representativeName: 'Jane Smith',
        representativeEmail: 'jane@company.com',
        representativePhone: '12345',
        recaptchaToken: 'token',
      };

      const fakeMember = createFakeMember();
      fakeMember.status = MemberStatus.PENDING;
      mockService.apply.mockResolvedValue(fakeMember);

      const result = await controller.apply(dto);

      expect(result).toEqual(MemberResponseDto.fromEntity(fakeMember));
      expect(mockService.apply).toHaveBeenCalledWith(dto);
    });
  });
});
