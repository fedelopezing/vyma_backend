import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionsService } from './professions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profession } from './entities/profession.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

describe('ProfessionsService', () => {
  let service: ProfessionsService;
  let mockRepository: DeepMocked<Repository<Profession>>;

  const createFakeProfession = (): Profession => {
    const profession = new Profession();
    profession.id = faker.number.int();
    profession.name = faker.word.noun().toUpperCase();
    profession.isActive = faker.datatype.boolean();
    profession.profiles = [];
    return profession;
  };

  beforeEach(async () => {
    mockRepository = createMock<Repository<Profession>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsService,
        {
          provide: getRepositoryToken(Profession),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProfessionsService>(ProfessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a profession successfully', async () => {
      const dto = {
        name: faker.word.noun(),
        description: faker.lorem.sentence(),
      };
      const profession = createFakeProfession();
      mockRepository.create.mockReturnValue(profession);
      mockRepository.save.mockResolvedValue(profession);

      const result = await service.create(dto);

      expect(result.data).toEqual(profession);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(profession);
    });

    it('should throw ConflictException on duplicate entry', async () => {
      mockRepository.save.mockRejectedValue({ code: '23505' });
      await expect(service.create({ name: faker.word.noun() })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of professions', async () => {
      const professions = [createFakeProfession(), createFakeProfession()];
      mockRepository.find.mockResolvedValue(professions);

      const result = await service.findAll();
      expect(result).toEqual(professions);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a profession by id', async () => {
      const profession = createFakeProfession();
      const id = profession.id;
      mockRepository.findOneBy.mockResolvedValue(profession);

      const result = await service.findOne(id);
      expect(result).toEqual(profession);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
    });

    it('should throw BadRequestException if profession not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(faker.number.int())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a profession successfully', async () => {
      const dto = { name: faker.word.noun() };
      const id = faker.number.int();
      mockRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const result = await service.update(id, dto);
      expect(result.data).toEqual(dto);
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
    });

    it('should throw NotFoundException if affected is 0', async () => {
      mockRepository.update.mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });
      await expect(
        service.update(faker.number.int(), { name: faker.word.noun() }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a profession successfully', async () => {
      const profession = createFakeProfession();
      const id = profession.id;
      mockRepository.findOneBy.mockResolvedValue(profession);
      mockRepository.softRemove.mockResolvedValue(profession);

      const result = await service.remove(id);
      expect(result.message).toBe('La profesión fue eliminado correctamente!');
      expect(mockRepository.softRemove).toHaveBeenCalledWith(profession);
    });
  });
});
