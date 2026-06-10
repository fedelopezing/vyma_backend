import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { ActivationTokensService } from './activation-tokens.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: DeepMocked<Repository<User>>;
  let mockDataSource: DeepMocked<DataSource>;
  let mockActivationTokensService: DeepMocked<ActivationTokensService>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  const createFakeUser = (): User => {
    const u = new User();
    u.id = faker.number.int();
    u.name = faker.person.fullName();
    u.email = faker.internet.email();
    u.passwordHash = 'hashedpassword';
    u.isActive = true;
    u.createdAt = new Date();
    u.updatedAt = new Date();
    return u;
  };

  beforeEach(async () => {
    mockRepository = createMock<Repository<User>>();
    mockDataSource = createMock<DataSource>();
    mockActivationTokensService = createMock<ActivationTokensService>();
    mockEventEmitter = createMock<EventEmitter2>();

    // Mock query runner and manager
    const mockQueryRunner = createMock<any>();
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    mockQueryRunner.manager = createMock<EntityManager>();
    mockQueryRunner.manager.getRepository.mockReturnValue(mockRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
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
    it('should create a user using the custom manager when manager is provided', async () => {
      const userData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        roleId: 1,
      } as any;
      const user = createFakeUser();

      const mockManager = createMock<EntityManager>();
      const mockManagerRepository = createMock<Repository<User>>();
      mockManager.getRepository.mockReturnValue(mockManagerRepository);
      mockManagerRepository.create.mockReturnValue(user);
      mockManagerRepository.save.mockResolvedValue(user as any);

      mockActivationTokensService.createToken.mockResolvedValue('raw-token');

      const result = await service.create(userData, mockManager);

      expect(result).toEqual(user);
      expect(mockManager.getRepository).toHaveBeenCalledWith(User);
      expect(mockManagerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email,
        }),
      );
      expect(mockManagerRepository.save).toHaveBeenCalledWith(user);
      expect(mockActivationTokensService.createToken).toHaveBeenCalledWith(
        user.id,
        mockManager,
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.created', {
        user,
        activationToken: 'raw-token',
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOneByEmailForLogin', () => {
    it('should find and return user by email with specific selection/relations', async () => {
      const user = createFakeUser();
      const email = user.email;
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneByEmailForLogin(email);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: {
          email: true,
          passwordHash: true,
          isActive: true,
          id: true,
          name: true,
          role: { id: true, name: true },
        },
        relations: ['profile', 'role'],
      });
    });
  });

  describe('findOneById', () => {
    it('should find and return user by id', async () => {
      const user = createFakeUser();
      const id = user.id;
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneById(id);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['role'],
      });
    });
  });

  describe('findOneWithPermissions', () => {
    it('should find and return user with role and permissions relation and selection', async () => {
      const user = createFakeUser();
      const id = user.id;
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneWithPermissions(id);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['role', 'role.permissions'],
        select: {
          id: true,
          role: {
            id: true,
            permissions: {
              action: true,
            },
          },
        },
      });
    });
  });

  describe('findUsersByRoleId', () => {
    it('should find users by roleId', async () => {
      mockRepository.find.mockResolvedValue([{ id: 1 }] as User[]);
      const result = await service.findUsersByRoleId(1);
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
