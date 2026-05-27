import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from './entities/role.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: DeepMocked<Repository<User>>;
  let mockRoleRepository: DeepMocked<Repository<Role>>;
  let mockJwtService: DeepMocked<JwtService>;
  let mockDataSource: DeepMocked<DataSource>;
  let mockProfilesService: DeepMocked<ProfilesService>;

  beforeEach(async () => {
    mockUserRepository = createMock<Repository<User>>();
    mockRoleRepository = createMock<Repository<Role>>();
    mockJwtService = createMock<JwtService>();
    mockDataSource = createMock<DataSource>();
    mockProfilesService = createMock<ProfilesService>();

    mockDataSource.transaction.mockImplementation(async (cb: any) => {
      return await cb(mockDataSource.manager);
    });

    mockDataSource.manager.getRepository.mockImplementation((entity: any) => {
      if (entity === User) return mockUserRepository as any;
      if (entity === Role) return mockRoleRepository as any;
      return null as any;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
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

  describe('create', () => {
    it('should create a user successfully', async () => {
      const email = faker.internet.email();
      const createUserDto = {
        email,
        name: faker.person.fullName(),
        password: faker.internet.password(),
        role: 'client',
      };
      const role = { id: faker.number.int(), name: 'client' };
      const user = {
        id: faker.number.int(),
        email,
        name: createUserDto.name,
        passwordHash: 'hash',
        role,
      };

      mockRoleRepository.findOne.mockResolvedValue(role as any);
      mockUserRepository.create.mockReturnValue(user as any);
      mockUserRepository.save.mockResolvedValue(user as any);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedpassword');

      const result = await service.create(
        createUserDto as unknown as CreateUserDto,
      );

      expect(result).toHaveProperty('email', email);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'client' },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.internet.password(),
          role: 'invalid',
        } as unknown as CreateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(
        service.login({
          email: faker.internet.email(),
          password: faker.internet.password(),
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      mockUserRepository.findOne.mockResolvedValue({ isActive: false } as any);
      await expect(
        service.login({
          email: faker.internet.email(),
          password: faker.internet.password(),
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
        profile: {
          avatarUrl: faker.image.avatar(),
          gender: 'other',
          birthDate: faker.date.birthdate(),
        },
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser as any);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email,
        password: faker.internet.password(),
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toHaveProperty('email', email);
    });
  });

  describe('handleDBErrors', () => {
    it('should throw ConflictException for code 23505', () => {
      expect(() => service.handleDBErrors({ code: '23505' })).toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for response message', () => {
      expect(() =>
        service.handleDBErrors({ response: { message: 'error' } }),
      ).toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException for other errors', () => {
      const mockConsoleError = jest
        .spyOn(console, 'error')
        .mockImplementation();
      expect(() => service.handleDBErrors({})).toThrow(
        InternalServerErrorException,
      );
      expect(mockConsoleError).toHaveBeenCalled();
      mockConsoleError.mockRestore();
    });
  });
});
