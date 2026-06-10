import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { ConflictException } from '@nestjs/common';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let typeOrmRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    typeOrmRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const userData = { email: 'test@test.com' };
      const createdUser = { id: 1, ...userData };

      jest
        .spyOn(typeOrmRepository, 'create')
        .mockReturnValue(createdUser as unknown as User);
      jest
        .spyOn(typeOrmRepository, 'save')
        .mockResolvedValue(createdUser as unknown as User);

      const result = await repository.create(userData);

      expect(typeOrmRepository.create).toHaveBeenCalledWith(userData);
      expect(typeOrmRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should create and save a new user using a provided EntityManager', async () => {
      const userData = { email: 'test@test.com' };
      const createdUser = { id: 1, ...userData };
      const managerRepository = {
        create: jest.fn().mockReturnValue(createdUser),
        save: jest.fn().mockResolvedValue(createdUser),
      };
      const manager = {
        getRepository: jest.fn().mockReturnValue(managerRepository),
      } as unknown as EntityManager;

      const result = await repository.create(userData, manager);

      expect(manager.getRepository).toHaveBeenCalledWith(User);
      expect(managerRepository.create).toHaveBeenCalledWith(userData);
      expect(managerRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException on duplicate email error (23505)', async () => {
      const userData = { email: 'test@test.com' };
      const createdUser = { id: 1, ...userData };

      jest
        .spyOn(typeOrmRepository, 'create')
        .mockReturnValue(createdUser as unknown as User);
      jest
        .spyOn(typeOrmRepository, 'save')
        .mockRejectedValue({ code: '23505' });

      await expect(repository.create(userData)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rethrow other errors', async () => {
      const userData = { email: 'test@test.com' };
      const createdUser = { id: 1, ...userData };
      const error = new Error('Database connection failed');

      jest
        .spyOn(typeOrmRepository, 'create')
        .mockReturnValue(createdUser as unknown as User);
      jest.spyOn(typeOrmRepository, 'save').mockRejectedValue(error);

      await expect(repository.create(userData)).rejects.toThrow(error);
    });
  });

  describe('findOneByEmailForLogin', () => {
    it('should return a user with login relations', async () => {
      const email = 'test@test.com';
      const user = { id: 1, email } as User;

      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(user);

      const result = await repository.findOneByEmailForLogin(email);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email },
          relations: ['profile', 'role'],
        }),
      );
      expect(result).toEqual(user);
    });
  });

  describe('findOneById', () => {
    it('should return a user by id with role relation', async () => {
      const id = 1;
      const user = { id } as User;

      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(user);

      const result = await repository.findOneById(id);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['role'],
      });
      expect(result).toEqual(user);
    });
  });

  describe('findOneWithPermissions', () => {
    it('should return a user with role and permissions', async () => {
      const id = 1;
      const user = { id } as User;

      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(user);

      const result = await repository.findOneWithPermissions(id);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id },
          relations: ['role', 'role.permissions'],
        }),
      );
      expect(result).toEqual(user);
    });
  });

  describe('findUsersByRoleId', () => {
    it('should return users with a specific role ID', async () => {
      const roleId = 1;
      const users = [{ id: 1 }, { id: 2 }];

      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(users as User[]);

      const result = await repository.findUsersByRoleId(roleId);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { role: { id: roleId } },
        select: ['id'],
      });
      expect(result).toEqual(users);
    });
  });
});
