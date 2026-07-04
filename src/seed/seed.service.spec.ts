import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { SeedRepository } from './seed.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { InternalServerErrorException } from '@nestjs/common';

describe('SeedService', () => {
  let service: SeedService;
  let seedRepository: DeepMocked<SeedRepository>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockPermissionsMap = {} as Record<string, unknown>;
  const mockRolesMap = {} as Record<string, unknown>;
  const mockUser = { id: 1, email: 'superadmin@mail.com' };
  const mockCompaniesMap = {
    CCPS: { id: 1, name: 'CCPS' },
    biolimpieza: { id: 2, name: 'biolimpieza' },
    natynails: { id: 3, name: 'natynails' },
  };

  beforeEach(async () => {
    seedRepository = createMock<SeedRepository>();
    seedRepository.createQueryRunner.mockReturnValue(mockQueryRunner as never);
    seedRepository.truncateAllTables.mockResolvedValue();
    seedRepository.createPermissions.mockResolvedValue(
      mockPermissionsMap as never,
    );
    seedRepository.createRoles.mockResolvedValue(mockRolesMap as never);
    seedRepository.createCompanies.mockResolvedValue(mockCompaniesMap as never);
    seedRepository.createAdminUser.mockResolvedValue(mockUser as never);
    seedRepository.createAdditionalUsers.mockResolvedValue();
    seedRepository.createNews.mockResolvedValue();
    seedRepository.createEvents.mockResolvedValue();
    seedRepository.createAds.mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: SeedRepository, useValue: seedRepository },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeSeed', () => {
    it('should orchestrate all seed steps and commit transaction', async () => {
      const result = await service.executeSeed();

      expect(result).toEqual({ message: 'Seed executed successfully' });
      expect(seedRepository.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(seedRepository.truncateAllTables).toHaveBeenCalledWith(
        mockQueryRunner,
      );
      expect(seedRepository.createPermissions).toHaveBeenCalledWith(
        mockQueryRunner,
      );
      expect(seedRepository.createRoles).toHaveBeenCalledWith(
        mockQueryRunner,
        mockPermissionsMap,
      );
      expect(seedRepository.createCompanies).toHaveBeenCalledWith(
        mockQueryRunner,
      );
      expect(seedRepository.createAdminUser).toHaveBeenCalledWith(
        mockQueryRunner,
        mockRolesMap,
      );
      expect(seedRepository.createAdditionalUsers).toHaveBeenCalledWith(
        mockQueryRunner,
        mockRolesMap,
        mockCompaniesMap,
      );
      expect(seedRepository.createNews).toHaveBeenCalledWith(
        mockQueryRunner,
        mockUser,
        mockCompaniesMap['CCPS'],
      );
      expect(seedRepository.createEvents).toHaveBeenCalledWith(
        mockQueryRunner,
        mockUser,
        mockCompaniesMap['CCPS'],
      );
      expect(seedRepository.createAds).toHaveBeenCalledWith(
        mockQueryRunner,
        mockCompaniesMap,
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction and throw InternalServerErrorException on failure', async () => {
      seedRepository.truncateAllTables.mockRejectedValue(new Error('DB error'));

      const mockLoggerError = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();

      await expect(service.executeSeed()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockLoggerError).toHaveBeenCalled();

      mockLoggerError.mockRestore();
    });
  });
});
