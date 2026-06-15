import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EntityManager } from 'typeorm';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ActivationTokensService } from '../users/activation-tokens.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ActivationToken } from '../users/entities/activation-token.entity';
import { UserCompany } from '../companies/entities/user-company.entity';
import { Company } from '../companies/entities/company.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockCompany: Company = {
  id: 1,
  uuid: 'company-uuid-1',
  name: 'CCPS',
} as Company;

const mockMembership = (companyId = 1): UserCompany =>
  ({
    userId: 10,
    companyId,
    roleId: 2,
    isActive: true,
    company: { ...mockCompany, id: companyId },
    role: { name: 'admin' },
  }) as unknown as UserCompany;

const mockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 10,
    uuid: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    passwordHash: 'hashed',
    isActive: true,
    isSuperAdmin: false,
    role: { name: 'admin' },
    ...overrides,
  }) as User;

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: DeepMocked<UsersService>;
  let mockActivationTokensService: DeepMocked<ActivationTokensService>;
  let mockJwtService: DeepMocked<JwtService>;
  let mockRefreshTokenRepo: DeepMocked<RefreshTokenRepository>;
  let mockUserCompanyRepository: DeepMocked<UserCompanyRepository>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  beforeEach(async () => {
    mockUsersService = createMock<UsersService>();
    mockActivationTokensService = createMock<ActivationTokensService>();
    mockJwtService = createMock<JwtService>();
    mockRefreshTokenRepo = createMock<RefreshTokenRepository>();
    mockUserCompanyRepository = createMock<UserCompanyRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

    mockRefreshTokenRepo.runTransaction.mockImplementation(
      async (cb: (manager: EntityManager) => Promise<unknown>) => {
        const mockManager = createMock<EntityManager>();
        mockManager.getRepository.mockImplementation(() => createMock());
        return await cb(mockManager);
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: ActivationTokensService,
          useValue: mockActivationTokensService,
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepo },
        {
          provide: UserCompanyRepository,
          useValue: mockUserCompanyRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(service).toBeDefined());

  // ─── activateAccount ──────────────────────────────────────────────────────

  describe('activateAccount', () => {
    it('should activate account successfully', async () => {
      const token = {
        id: 1,
        expiresAt: new Date(Date.now() + 10000),
        user: { id: 1, passwordHash: '' } as User,
      };
      mockActivationTokensService.findActiveToken.mockResolvedValue(
        token as unknown as ActivationToken,
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');

      const result = await service.activateAccount({
        token: 'valid_token',
        password: 'Password123!',
      });

      expect(result).toEqual({ message: 'Account activated successfully' });
    });

    it('should throw BadRequestException if token not found', async () => {
      mockActivationTokensService.findActiveToken.mockResolvedValue(null);
      await expect(
        service.activateAccount({ token: 'bad', password: 'Pass123!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token expired', async () => {
      const token = {
        id: 1,
        expiresAt: new Date(Date.now() - 10000),
        user: { id: 1 } as User,
      };
      mockActivationTokensService.findActiveToken.mockResolvedValue(
        token as unknown as ActivationToken,
      );
      await expect(
        service.activateAccount({ token: 'expired', password: 'Pass123!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    const credentials = {
      email: faker.internet.email(),
      password: 'Password1!',
    };

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(null);
      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(
        mockUser({ isActive: false }),
      );
      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user has no memberships', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserCompanyRepository.findMembershipsByUserId.mockResolvedValue([]);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Case A: should return full JWT when user has exactly 1 membership', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh');
      mockUserCompanyRepository.findMembershipsByUserId.mockResolvedValue([
        mockMembership(1),
      ]);
      mockJwtService.sign.mockReturnValue('access-token');
      mockRefreshTokenRepo.create.mockReturnValue({} as RefreshToken);
      mockRefreshTokenRepo.save.mockResolvedValue({} as RefreshToken);

      const result = await service.login(credentials);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).not.toHaveProperty('requiresCompanySelection');
    });

    it('Case B: should return selectionToken when user has multiple memberships', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserCompanyRepository.findMembershipsByUserId.mockResolvedValue([
        mockMembership(1),
        mockMembership(2),
      ]);
      mockJwtService.sign.mockReturnValue('selection-token');

      const result = await service.login(credentials);

      expect(result).toHaveProperty('requiresCompanySelection', true);
      expect(result).toHaveProperty('selectionToken', 'selection-token');
      expect((result as { companies: unknown[] }).companies).toHaveLength(2);
    });
  });

  // ─── selectCompany ────────────────────────────────────────────────────────

  describe('selectCompany', () => {
    const selectionToken = 'valid.selection.token';
    const dto = { companyUuid: 'company-uuid-1' };

    it('should throw UnauthorizedException if selectionToken is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.selectCompany(selectionToken, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user is not a member of the company', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 10 });
      mockUserCompanyRepository.findMembershipsByUserId.mockResolvedValue([
        mockMembership(99),
      ]); // different company uuid

      await expect(
        service.selectCompany(selectionToken, { companyUuid: 'other-uuid' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return full JWT when selection is valid', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 10 });
      mockUserCompanyRepository.findMembershipsByUserId.mockResolvedValue([
        mockMembership(1),
      ]);
      mockUserCompanyRepository.isActiveMember.mockResolvedValue(true);
      mockUsersService.findOneById.mockResolvedValue(mockUser());
      mockJwtService.sign.mockReturnValue('final-access-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh');
      mockRefreshTokenRepo.create.mockReturnValue({} as RefreshToken);
      mockRefreshTokenRepo.save.mockResolvedValue({} as RefreshToken);

      const result = await service.selectCompany(selectionToken, dto);

      expect(result).toHaveProperty('accessToken', 'final-access-token');
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should revoke token and return success message', async () => {
      const token = { uuid: 'token', isRevoked: false } as RefreshToken;
      mockRefreshTokenRepo.findOneByToken.mockResolvedValue(token);

      const result = await service.logout('token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(token.isRevoked).toBe(true);
      expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(token);
    });
  });
});
