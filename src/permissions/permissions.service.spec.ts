import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { createMock } from '@golevelup/ts-jest';
import { PermissionNotFoundException } from './exceptions/permission-not-found.exception';
import { PermissionsRepository } from './repositories/permissions.repository';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repository: PermissionsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionsRepository,
          useValue: createMock<PermissionsRepository>(),
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get<PermissionsRepository>(PermissionsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const permissions = [
        { id: 1, action: 'read:news' },
        { id: 2, action: 'create:news' },
      ] as Permission[];

      jest.spyOn(repository, 'findAll').mockResolvedValue(permissions);

      const result = await service.findAll();
      expect(result).toEqual(permissions);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single permission', async () => {
      const permission = { id: 1, action: 'read:news' } as Permission;
      jest.spyOn(repository, 'findOne').mockResolvedValue(permission);

      const result = await service.findOne(1);
      expect(result).toEqual(permission);
      expect(repository.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw PermissionNotFoundException if permission not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        PermissionNotFoundException,
      );
    });
  });
});
