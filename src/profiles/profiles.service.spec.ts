import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { User } from '../users/entities/user.entity';
import { Profession } from '../professions/entities/profession.entity';
import { AuthService } from '../auth/auth.service';
import { NotFoundException } from '@nestjs/common';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let profileRepository: DeepMocked<Repository<Profile>>;
  let mockAuthService: DeepMocked<AuthService>;

  beforeEach(async () => {
    mockAuthService = createMock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: createMock<Repository<Profile>>(),
        },
        {
          provide: DataSource,
          useValue: createMock<DataSource>(),
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    profileRepository = module.get<DeepMocked<Repository<Profile>>>(
      getRepositoryToken(Profile),
    );
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
        user: { id: createProfileDto.userId } as User,
        profession: { id: createProfileDto.professionId } as Profession,
      });

      const mockRepo = createMock<Repository<Profile>>();
      mockRepo.create.mockReturnValue(expectedProfile);
      mockRepo.save.mockResolvedValue(expectedProfile);

      const mockManager = createMock<EntityManager>();
      mockManager.getRepository.mockReturnValue(mockRepo);

      const result = await service.create(createProfileDto, mockManager);

      expect(mockManager.getRepository).toHaveBeenCalledWith(Profile);
      expect(mockRepo.create).toHaveBeenCalledWith({
        user: { id: createProfileDto.userId },
        profession: { id: createProfileDto.professionId },
      });
      expect(mockRepo.save).toHaveBeenCalledWith(expectedProfile);
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('findAll', () => {
    it('should return an array of profiles', async () => {
      const expectedProfiles = [
        createMock<Profile>({ id: faker.number.int() }),
      ];

      profileRepository.find.mockResolvedValue(expectedProfiles);

      const result = await service.findAll();

      expect(profileRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'profession'],
      });
      expect(result).toEqual(expectedProfiles);
    });
  });

  describe('findOne', () => {
    it('should return a profile by id', async () => {
      const id = faker.number.int();
      const expectedProfile = createMock<Profile>({ id });

      profileRepository.findOne.mockResolvedValue(expectedProfile);

      const result = await service.findOne(id);

      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['user', 'profession'],
      });
      expect(result).toEqual(expectedProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const id = faker.number.int();
      const updateDto = {};
      const existingProfile = createMock<Profile>({ id });
      const savedProfile = createMock<Profile>({ id });

      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.save.mockResolvedValue(savedProfile);

      const result = await service.update(id, updateDto);

      expect(profileRepository.save).toHaveBeenCalledWith(existingProfile);
      expect(result).toEqual(savedProfile);
    });
  });

  describe('remove', () => {
    it('should remove a profile', async () => {
      const id = faker.number.int();
      const existingProfile = createMock<Profile>({ id });

      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.remove.mockResolvedValue(existingProfile);

      const result = await service.remove(id);

      expect(profileRepository.remove).toHaveBeenCalledWith(existingProfile);
      expect(result).toEqual(existingProfile);
    });
  });
});
