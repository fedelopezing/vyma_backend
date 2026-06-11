import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { ProfilesRepository } from './repositories/profiles.repository';
import { EntityManager } from 'typeorm';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: DeepMocked<ProfilesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: ProfilesRepository,
          useValue: createMock<ProfilesRepository>(),
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    repository = module.get<DeepMocked<ProfilesRepository>>(ProfilesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile', async () => {
      const createProfileDto = {
        userId: faker.number.int(),
        professionId: faker.number.int(),
      };

      const expectedProfile = createMock<Profile>({
        id: faker.number.int(),
      });

      const mockManager = createMock<EntityManager>();
      repository.createProfile.mockResolvedValue(expectedProfile);

      const result = await service.create(createProfileDto, mockManager);

      expect(repository.createProfile).toHaveBeenCalledWith(
        createProfileDto,
        mockManager,
      );
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('findAll', () => {
    it('should return an array of profiles', async () => {
      const expectedProfiles = [
        createMock<Profile>({ id: faker.number.int() }),
      ];

      repository.findAll.mockResolvedValue(expectedProfiles);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedProfiles);
    });
  });

  describe('findOne', () => {
    it('should return a profile by id', async () => {
      const id = faker.number.int();
      const expectedProfile = createMock<Profile>({ id });

      repository.findOneById.mockResolvedValue(expectedProfile);

      const result = await service.findOne(id);

      expect(repository.findOneById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      repository.findOneById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const id = faker.number.int();
      const updateDto = {};
      const existingProfile = createMock<Profile>({ id });
      const savedProfile = createMock<Profile>({ id });

      repository.findOneById.mockResolvedValue(existingProfile);
      repository.save.mockResolvedValue(savedProfile);

      const result = await service.update(id, updateDto);

      expect(repository.save).toHaveBeenCalledWith(existingProfile);
      expect(result).toEqual(savedProfile);
    });
  });

  describe('remove', () => {
    it('should remove a profile', async () => {
      const id = faker.number.int();
      const existingProfile = createMock<Profile>({ id });

      repository.findOneById.mockResolvedValue(existingProfile);
      repository.remove.mockResolvedValue(existingProfile);

      const result = await service.remove(id);

      expect(repository.remove).toHaveBeenCalledWith(existingProfile);
      expect(result).toEqual(existingProfile);
    });
  });
});
