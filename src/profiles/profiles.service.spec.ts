import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { User } from '../users/entities/user.entity';
import { Profession } from '../professions/entities/profession.entity';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let profileRepository: Repository<Profile>;

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    profileRepository = module.get<Repository<Profile>>(
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

      jest.spyOn(profileRepository, 'find').mockResolvedValue(expectedProfiles);

      const result = await service.findAll();

      expect(profileRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedProfiles);
    });
  });

  describe('findOne', () => {
    it('should return a placeholder string', () => {
      const id = faker.number.int();
      expect(service.findOne(id)).toBe(`This action returns a #${id} profile`);
    });
  });

  describe('update', () => {
    it('should return a placeholder string', () => {
      const id = faker.number.int();
      expect(service.update(id, {})).toBe(
        `This action updates a #${id} profile`,
      );
    });
  });

  describe('remove', () => {
    it('should return a placeholder string', () => {
      const id = faker.number.int();
      expect(service.remove(id)).toBe(`This action removes a #${id} profile`);
    });
  });
});
