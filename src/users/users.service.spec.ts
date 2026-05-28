import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Repository, EntityManager } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: DeepMocked<Repository<User>>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user using the default repository when no manager is provided', async () => {
      const userData: Partial<User> = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const user = createFakeUser();
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.create(userData);

      expect(result).toEqual(user);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should create a user using the custom manager when manager is provided', async () => {
      const userData: Partial<User> = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const user = createFakeUser();

      const mockManager = createMock<EntityManager>();
      const mockManagerRepository = createMock<Repository<User>>();
      mockManager.getRepository.mockReturnValue(mockManagerRepository);
      mockManagerRepository.create.mockReturnValue(user);
      mockManagerRepository.save.mockResolvedValue(user);

      const result = await service.create(userData, mockManager);

      expect(result).toEqual(user);
      expect(mockManager.getRepository).toHaveBeenCalledWith(User);
      expect(mockManagerRepository.create).toHaveBeenCalledWith(userData);
      expect(mockManagerRepository.save).toHaveBeenCalledWith(user);
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
});
