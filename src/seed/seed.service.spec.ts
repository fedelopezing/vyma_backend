import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';

describe('SeedService', () => {
  let service: SeedService;
  let mockRoleRepository: DeepMocked<Repository<Role>>;
  let mockPermissionRepository: DeepMocked<Repository<Permission>>;
  let mockUserRepository: DeepMocked<Repository<User>>;

  beforeEach(async () => {
    mockRoleRepository = createMock<Repository<Role>>();
    mockPermissionRepository = createMock<Repository<Permission>>();
    mockUserRepository = createMock<Repository<User>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeSeed', () => {
    it('should seed permissions, roles, and users successfully', async () => {
      mockPermissionRepository.findOne.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => dto as never);
      mockPermissionRepository.save.mockImplementation(
        async (entity) => entity as never,
      );

      const fakePermissions = [
        { id: 1, action: 'read:news' },
        { id: 2, action: 'create:news' },
        { id: 3, action: 'update:news' },
      ];
      mockPermissionRepository.find.mockResolvedValue(fakePermissions as never);

      mockRoleRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation((dto) => dto as never);
      mockRoleRepository.save.mockImplementation(
        async (entity) => entity as never,
      );

      const adminRole = { id: 10, name: 'admin' };
      mockRoleRepository.findOne.mockResolvedValue(adminRole as never);

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto) => dto as never);
      mockUserRepository.save.mockImplementation(
        async (entity) => entity as never,
      );
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.executeSeed();

      expect(result).toEqual({ message: 'Seed executed successfully' });
      expect(mockPermissionRepository.save).toHaveBeenCalled();
      expect(mockRoleRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockPermissionRepository.findOne.mockRejectedValue(
        new Error('DB connection lost'),
      );
      const mockLoggerError = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();

      await expect(service.executeSeed()).rejects.toThrow();
      expect(mockLoggerError).toHaveBeenCalled();
      mockLoggerError.mockRestore();
    });
  });
});
