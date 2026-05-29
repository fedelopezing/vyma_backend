import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Service } from './entities/service.entity';

describe('ServicesController', () => {
  let controller: ServicesController;
  let mockService: DeepMocked<ServicesService>;

  const createFakeService = (): Service => {
    const service = new Service();
    service.id = faker.number.int();
    service.name = faker.commerce.productName();
    service.description = faker.lorem.sentence();
    service.durationMinutes = faker.number.int({ min: 15, max: 120 });
    service.price = Number(faker.commerce.price());
    service.isActive = true;
    service.createdAt = new Date();
    service.updatedAt = new Date();
    return service;
  };

  beforeEach(async () => {
    mockService = createMock<ServicesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a service', async () => {
    const dto = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: Number(faker.commerce.price()),
      duration: faker.number.int({ min: 15, max: 120 }),
    };
    const expectedResult = {
      message: 'El servicio ha sido creado correctamente!',
      data: createFakeService(),
    };
    mockService.create.mockResolvedValue(expectedResult as never);

    expect(await controller.create(dto as never)).toEqual(expectedResult);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should findAll services', async () => {
    const expectedResult = [createFakeService(), createFakeService()];
    mockService.findAll.mockResolvedValue(expectedResult);

    expect(await controller.findAll()).toEqual(expectedResult);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should findAll services with query', async () => {
    const query = faker.word.noun();
    const expectedResult = [createFakeService()];
    mockService.findAll.mockResolvedValue(expectedResult);

    expect(await controller.findAll(query)).toEqual(expectedResult);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
  });

  it('should findOne service', async () => {
    const id = faker.number.int();
    const expectedResult = createFakeService();
    expectedResult.id = id;
    mockService.findOne.mockResolvedValue(expectedResult);

    expect(await controller.findOne(id.toString())).toEqual(expectedResult);
    expect(mockService.findOne).toHaveBeenCalledWith(id);
  });

  it('should update a service', async () => {
    const id = faker.number.int();
    const dto = { name: faker.commerce.productName() };
    const expectedResult = {
      message: 'El servicio ha sido actualizado correctamente!',
      data: dto,
    };
    mockService.update.mockResolvedValue(expectedResult as never);

    expect(await controller.update(id.toString(), dto)).toEqual(expectedResult);
    expect(mockService.update).toHaveBeenCalledWith(id, dto);
  });

  it('should remove a service', async () => {
    const id = faker.number.int();
    const expectedResult = {
      message: 'El servicio fue eliminado correctamente!',
    };
    mockService.remove.mockResolvedValue(expectedResult);

    expect(await controller.remove(id.toString())).toEqual(expectedResult);
    expect(mockService.remove).toHaveBeenCalledWith(id);
  });
});
