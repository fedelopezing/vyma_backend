import { Test, TestingModule } from '@nestjs/testing';
import {
  AdminMembersController,
  AuthenticatedRequest,
} from './admin-members.controller';
import { AdminMembersService } from './admin-members.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Member, MemberStatus, FeeType } from './entities/member.entity';
import { MemberResponseDto, UpdateMemberDto } from './dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('AdminMembersController', () => {
  let controller: AdminMembersController;
  let mockService: DeepMocked<AdminMembersService>;

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

  const mockRequest = {
    companyId: 1,
    user: {
      sub: 1,
      companyId: 1,
      isSuperAdmin: false,
      uuid: 'uuid',
      email: 'admin@company.com',
      role: 'admin',
    } as JwtPayload,
  };

  beforeEach(async () => {
    mockService = createMock<AdminMembersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminMembersController],
      providers: [
        {
          provide: AdminMembersService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ModuleAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminMembersController>(AdminMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllAdmin', () => {
    it('should return mapped paginated members', async () => {
      const fakeMembers = [createFakeMember()];
      const serviceResult = {
        data: fakeMembers,
        meta: {
          page: 1,
          limit: 12,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockService.findAll.mockResolvedValue(serviceResult);

      const result = await controller.findAllAdmin(
        { page: 1, limit: 12 },
        mockRequest as unknown as AuthenticatedRequest,
      );

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        MemberResponseDto.fromEntity(fakeMembers[0]),
      );
      expect(mockService.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 12 },
        1,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update member status and return mapped member', async () => {
      const fakeMember = createFakeMember();
      mockService.updateStatus.mockResolvedValue({
        ...fakeMember,
        status: MemberStatus.APPROVED,
      });

      const result = await controller.updateStatus(
        fakeMember.id,
        MemberStatus.APPROVED,
        1,
        mockRequest as unknown as AuthenticatedRequest,
      );

      expect(result).toEqual(
        MemberResponseDto.fromEntity({
          ...fakeMember,
          status: MemberStatus.APPROVED,
        }),
      );
      expect(mockService.updateStatus).toHaveBeenCalledWith(
        fakeMember.id,
        MemberStatus.APPROVED,
        1,
        1,
      );
    });
  });

  describe('updateFeatured', () => {
    it('should update featured status and return mapped member', async () => {
      const fakeMember = createFakeMember();
      mockService.updateFeatured.mockResolvedValue({
        ...fakeMember,
        isFeatured: true,
      });

      const result = await controller.updateFeatured(
        fakeMember.id,
        true,
        1,
        mockRequest as unknown as AuthenticatedRequest,
      );

      expect(result).toEqual(
        MemberResponseDto.fromEntity({ ...fakeMember, isFeatured: true }),
      );
      expect(mockService.updateFeatured).toHaveBeenCalledWith(
        fakeMember.id,
        true,
        1,
        1,
      );
    });
  });

  describe('update', () => {
    it('should update member general info and return mapped member', async () => {
      const fakeMember = createFakeMember();
      const dto: UpdateMemberDto = { companyName: 'Updated Acme', version: 1 };
      mockService.update.mockResolvedValue({
        ...fakeMember,
        companyName: 'Updated Acme',
      });

      const result = await controller.update(
        fakeMember.id,
        dto,
        mockRequest as unknown as AuthenticatedRequest,
      );

      expect(result).toEqual(
        MemberResponseDto.fromEntity({
          ...fakeMember,
          companyName: 'Updated Acme',
        }),
      );
      expect(mockService.update).toHaveBeenCalledWith(fakeMember.id, dto, 1);
    });
  });
});
