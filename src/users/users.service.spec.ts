import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { ActivationTokensService } from './activation-tokens.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from './repositories/users.repository';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository: DeepMocked<UsersRepository>;
  let mockDataSource: DeepMocked<DataSource>;
  let mockActivationTokensService: DeepMocked<ActivationTokensService>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  const createFakeUser = (): User => {
    const u = new User();
    u.id = faker.number.int();
    u.name = faker.person.fullName();
    u.email = faker.internet.email();
    u.passwordHash = 'hashedpassword';
    u.isActive = false;
    u.createdAt = new Date();
    u.updatedAt = new Date();
    return u;
  };

  beforeEach(async () => {
    mockUsersRepository = createMock<UsersRepository>();
    mockDataSource = createMock<DataSource>();
    mockActivationTokensService = createMock<ActivationTokensService>();
    mockEventEmitter = createMock<EventEmitter2>();

    const mockQueryRunner = createMock<QueryRunner>();
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    Object.defineProperty(mockQueryRunner, 'manager', {
      value: createMock<EntityManager>(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ActivationTokensService,
          useValue: mockActivationTokensService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user, generate token, and emit event with provided manager', async () => {
      const userData: CreateUserDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const user = createFakeUser();

      const mockManager = createMock<EntityManager>();

      mockUsersRepository.create.mockResolvedValue(user);
      mockActivationTokensService.createToken.mockResolvedValue('raw-token');

      const result = await service.create(userData, mockManager);

      expect(result).toEqual(user);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email,
          isActive: false,
        }),
        mockManager,
      );
      expect(mockActivationTokensService.createToken).toHaveBeenCalledWith(
        user.id,
        mockManager,
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.created', {
        user,
        activationToken: 'raw-token',
      });
    });

    it('should run transaction when manager is not provided', async () => {
      const userData: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@test.com',
      };
      const user = createFakeUser();
      const mockManager = createMock<EntityManager>();

      mockUsersRepository.runTransaction.mockImplementation(async (cb) => {
        return cb(mockManager);
      });
      mockUsersRepository.create.mockResolvedValue(user);
      mockActivationTokensService.createToken.mockResolvedValue('raw-token-2');

      const result = await service.create(userData);

      expect(result).toEqual(user);
      expect(mockUsersRepository.runTransaction).toHaveBeenCalled();
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe' }),
        mockManager,
      );
    });

    it('should throw ConflictException if email is duplicated', async () => {
      const userData: CreateUserDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const mockManager = createMock<EntityManager>();

      mockUsersRepository.create.mockRejectedValue(
        new ConflictException('A user with this email already exists'),
      );

      await expect(service.create(userData, mockManager)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOneByEmailForLogin', () => {
    it('should find and return user by email when user exists', async () => {
      const user = createFakeUser();
      const email = user.email;
      mockUsersRepository.findOneByEmailForLogin.mockResolvedValue(user);

      const result = await service.findOneByEmailForLogin(email);

      expect(result).toEqual(user);
      expect(mockUsersRepository.findOneByEmailForLogin).toHaveBeenCalledWith(
        email,
      );
    });

    it('should return null when user does not exist', async () => {
      const email = faker.internet.email();
      mockUsersRepository.findOneByEmailForLogin.mockResolvedValue(null);

      const result = await service.findOneByEmailForLogin(email);

      expect(result).toBeNull();
      expect(mockUsersRepository.findOneByEmailForLogin).toHaveBeenCalledWith(
        email,
      );
    });
  });

  describe('findOneById', () => {
    it('should find and return user by id', async () => {
      const user = createFakeUser();
      const id = user.id;
      mockUsersRepository.findOneById.mockResolvedValue(user);

      const result = await service.findOneById(id);

      expect(result).toEqual(user);
      expect(mockUsersRepository.findOneById).toHaveBeenCalledWith(id);
    });
  });

  describe('findOneByUuid', () => {
    it('should find and return user by uuid', async () => {
      const user = createFakeUser();
      mockUsersRepository.findOneByUuid.mockResolvedValue(user);

      const result = await service.findOneByUuid('uuid-123');

      expect(result).toEqual(user);
      expect(mockUsersRepository.findOneByUuid).toHaveBeenCalledWith(
        'uuid-123',
      );
    });
  });

  describe('findAll', () => {
    it('should find and return all users', async () => {
      const users = [createFakeUser(), createFakeUser()];
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });
});
