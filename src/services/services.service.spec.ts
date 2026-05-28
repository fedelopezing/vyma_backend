import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';

describe('ServicesService', () => {
  let service: ServicesService;
  let mockRepository: DeepMocked<Repository<Service>>;
  let mockQueryBuilder: DeepMocked<SelectQueryBuilder<Service>>;

  const createFakeService = (): Service => {
    const s = new Service();
    s.id = faker.number.int();
    s.name = faker.commerce.productName();
    s.description = faker.lorem.sentence();
    s.durationMinutes = faker.number.int({ min: 15, max: 120 });
    s.price = Number(faker.commerce.price());
    s.isActive = true;
    s.createdAt = new Date();
    s.updatedAt = new Date();
    return s;
  };

  beforeEach(async () => {
    mockRepository = createMock<Repository<Service>>();
    mockQueryBuilder = createMock<SelectQueryBuilder<Service>>();
    mockQueryBuilder.where.mockReturnThis();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a service successfully', async () => {
      const dto: CreateServiceDto = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: Number(faker.commerce.price()),
        durationMinutes: faker.number.int({ min: 15, max: 120 }),
      };
      const s = createFakeService();
      mockRepository.create.mockReturnValue(s);
      mockRepository.save.mockResolvedValue(s);

      const result = await service.create(dto);

      expect(result.data).toEqual(s);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(s);
    });

    it('should throw ConflictException on duplicate entry', async () => {
      mockRepository.save.mockRejectedValue({ code: '23505' });
      await expect(
        service.create({
          name: faker.commerce.productName(),
        } as unknown as CreateServiceDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of services without name filter', async () => {
      const services = [createFakeService(), createFakeService()];
      mockQueryBuilder.getMany.mockResolvedValue(services);

      const result = await service.findAll();
      expect(result).toEqual(services);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('service');
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should return an array of services with name filter', async () => {
      const name = faker.word.noun();
      const services = [createFakeService()];
      mockQueryBuilder.getMany.mockResolvedValue(services);

      const result = await service.findAll(name);
      expect(result).toEqual(services);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('service');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(service.name) LIKE :name',
        { name: `%${name.toLowerCase()}%` },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      const s = createFakeService();
      const id = s.id;
      mockRepository.findOneBy.mockResolvedValue(s);

      const result = await service.findOne(id);
      expect(result).toEqual(s);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
    });

    it('should throw BadRequestException if service not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(faker.number.int())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a service successfully', async () => {
      const dto = { name: faker.commerce.productName() };
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
        service.update(faker.number.int(), {
          name: faker.commerce.productName(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a service successfully', async () => {
      const s = createFakeService();
      const id = s.id;
      mockRepository.findOneBy.mockResolvedValue(s);
      mockRepository.softRemove.mockResolvedValue(s);

      const result = await service.remove(id);
      expect(result.message).toBe('El servicio fue eliminado correctamente!');
      expect(mockRepository.softRemove).toHaveBeenCalledWith(s);
    });
  });
});
