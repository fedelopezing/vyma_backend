import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ActivationTokensService } from '../users/activation-tokens.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { RefreshToken } from './entities/refresh-token.entity';
import { EntityManager } from 'typeorm';
import { ActivationToken } from '../users/entities/activation-token.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: DeepMocked<UsersService>;
  let mockActivationTokensService: DeepMocked<ActivationTokensService>;
  let mockJwtService: DeepMocked<JwtService>;
  let mockRefreshTokenRepo: DeepMocked<RefreshTokenRepository>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  beforeEach(async () => {
    mockUsersService = createMock<UsersService>();
    mockActivationTokensService = createMock<ActivationTokensService>();
    mockJwtService = createMock<JwtService>();
    mockRefreshTokenRepo = createMock<RefreshTokenRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

    mockRefreshTokenRepo.runTransaction.mockImplementation(
      async (cb: (manager: EntityManager) => Promise<unknown>) => {
        const mockManager = createMock<EntityManager>();
        mockManager.getRepository.mockImplementation(() => {
          return createMock();
        });
        return await cb(mockManager);
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ActivationTokensService,
          useValue: mockActivationTokensService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepo,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('activateAccount', () => {
    it('should activate account successfully', async () => {
      const mockToken = {
        id: 1,
        expiresAt: new Date(Date.now() + 10000),
        user: { id: 1, passwordHash: '' } as User,
      };
      mockActivationTokensService.findActiveToken.mockResolvedValue(
        mockToken as unknown as ActivationToken,
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');

      const result = await service.activateAccount({
        token: 'valid_token',
        password: 'Password123!',
      });

      expect(result).toEqual({ message: 'Account activated successfully' });
      expect(mockActivationTokensService.markAsUsed).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if token not found', async () => {
      mockActivationTokensService.findActiveToken.mockResolvedValue(null);

      await expect(
        service.activateAccount({
          token: 'invalid_token',
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token expired', async () => {
      const mockToken = {
        id: 1,
        expiresAt: new Date(Date.now() - 10000),
        user: { id: 1 } as User,
      };
      mockActivationTokensService.findActiveToken.mockResolvedValue(
        mockToken as unknown as ActivationToken,
      );

      await expect(
        service.activateAccount({
          token: 'expired_token',
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendActivation', () => {
    const email = 'test@mail.com';

    it('should return generic success message if user does not exist', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(null);

      const result = await service.resendActivation({ email });

      expect(result.message).toContain(
        'Si el correo electrónico está registrado',
      );
      expect(mockActivationTokensService.createToken).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return generic success message if user is already active', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue({
        id: 1,
        email,
        isActive: true,
      } as User);

      const result = await service.resendActivation({ email });

      expect(result.message).toContain(
        'Si el correo electrónico está registrado',
      );
      expect(mockActivationTokensService.createToken).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should create new token and emit user.created event if user is inactive', async () => {
      const mockUser = {
        id: 1,
        email,
        isActive: false,
      } as User;
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(mockUser);
      mockActivationTokensService.createToken.mockResolvedValue(
        'new-raw-token',
      );

      const result = await service.resendActivation({ email });

      expect(result.message).toContain(
        'Si el correo electrónico está registrado',
      );
      expect(mockActivationTokensService.createToken).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.created', {
        user: mockUser,
        activationToken: 'new-raw-token',
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(null);
      await expect(
        service.login({
          email: faker.internet.email(),
          password: faker.internet.password(),
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      mockUsersService.findOneByEmailForLogin.mockResolvedValue({
        isActive: false,
      } as unknown as User);
      await expect(
        service.login({
          email: faker.internet.email(),
          password: faker.internet.password(),
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const email = faker.internet.email();
      const mockUser = {
        id: faker.number.int(),
        email,
        name: faker.person.fullName(),
        passwordHash: 'hashedpassword',
        isActive: true,
      };
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(
        mockUser as unknown as User,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully if credentials are valid', async () => {
      const email = faker.internet.email();
      const name = faker.person.fullName();
      const mockUser = {
        id: faker.number.int(),
        email,
        name,
        passwordHash: 'hashedpassword',
        isActive: true,
        role: { name: 'client' },
      };
      mockUsersService.findOneByEmailForLogin.mockResolvedValue(
        mockUser as unknown as User,
      );
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash_refresh');
      mockRefreshTokenRepo.create.mockReturnValue({} as RefreshToken);
      mockRefreshTokenRepo.save.mockResolvedValue({} as RefreshToken);

      const result = await service.login({
        email,
        password: faker.internet.password(),
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user).toHaveProperty('email', email);
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException if token not found', async () => {
      mockRefreshTokenRepo.findOneByTokenWithUser.mockResolvedValue(null);
      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is revoked', async () => {
      const mockToken = {
        isRevoked: true,
        user: { id: 1 },
      } as RefreshToken;
      mockRefreshTokenRepo.findOneByTokenWithUser.mockResolvedValue(mockToken);

      await expect(service.refreshTokens('revoked_token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(
        mockRefreshTokenRepo.updateRevokeStatusByUser,
      ).toHaveBeenCalledWith(1, true);
    });

    it('should throw UnauthorizedException if token has expired', async () => {
      const mockToken = {
        isRevoked: false,
        expiresAt: new Date(Date.now() - 10000),
        user: { id: 1 },
      } as RefreshToken;
      mockRefreshTokenRepo.findOneByTokenWithUser.mockResolvedValue(mockToken);

      await expect(service.refreshTokens('expired_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should refresh tokens successfully', async () => {
      const mockToken = {
        isRevoked: false,
        expiresAt: new Date(Date.now() + 10000),
        user: { id: 1 },
      } as RefreshToken;
      const mockUser = {
        id: 1,
        isActive: true,
        email: 'test@mail.com',
        role: { name: 'client' },
      } as User;

      mockRefreshTokenRepo.findOneByTokenWithUser.mockResolvedValue(mockToken);
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-access-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash_refresh');
      mockRefreshTokenRepo.create.mockReturnValue({} as RefreshToken);
      mockRefreshTokenRepo.save.mockResolvedValue({} as RefreshToken);

      const result = await service.refreshTokens('valid_token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(mockRefreshTokenRepo.save).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke token successfully', async () => {
      const mockToken = {
        uuid: 'token',
        isRevoked: false,
      } as RefreshToken;
      mockRefreshTokenRepo.findOneByToken.mockResolvedValue(mockToken);

      const result = await service.logout('token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockToken.isRevoked).toBe(true);
      expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(mockToken);
    });
  });
});
