import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { Profession } from './entities/profession.entity';

import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let mockService: DeepMocked<ProfessionsService>;

  const createFakeProfession = (): Profession => {
    const profession = new Profession();
    profession.id = faker.number.int();
    profession.name = faker.word.noun().toUpperCase();
    profession.isActive = true;
    profession.profiles = [];
    return profession;
  };

  beforeEach(async () => {
    mockService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionsController],
      providers: [
        {
          provide: ProfessionsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a profession', async () => {
    const dto = {
      name: faker.word.noun(),
      description: faker.lorem.sentence(),
    };
    const profession = createFakeProfession();
    const expectedResult = {
      message: 'La profesión ha sido creado correctamente!',
      data: profession,
    };
    mockService.create.mockResolvedValue(expectedResult);

    expect(await controller.create(dto)).toEqual(expectedResult);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should findAll professions', async () => {
    const expectedResult = [createFakeProfession(), createFakeProfession()];
    mockService.findAll.mockResolvedValue(expectedResult);

    expect(await controller.findAll()).toEqual(expectedResult);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should findOne profession', async () => {
    const id = faker.number.int();
    const expectedResult = createFakeProfession();
    expectedResult.id = id;
    mockService.findOne.mockResolvedValue(expectedResult);

    expect(await controller.findOne(id.toString())).toEqual(expectedResult);
    expect(mockService.findOne).toHaveBeenCalledWith(id);
  });

  it('should update a profession', async () => {
    const id = faker.number.int();
    const dto = { name: faker.word.noun() };
    const expectedResult = {
      message: 'La profesión ha sido actualizado correctamente!',
      data: dto,
    };
    mockService.update.mockResolvedValue(expectedResult);

    expect(await controller.update(id.toString(), dto)).toEqual(expectedResult);
    expect(mockService.update).toHaveBeenCalledWith(id, dto);
  });

  it('should remove a profession', async () => {
    const id = faker.number.int();
    const expectedResult = {
      message: 'La profesión fue eliminado correctamente!',
    };
    mockService.remove.mockResolvedValue(expectedResult);

    expect(await controller.remove(id.toString())).toEqual(expectedResult);
    expect(mockService.remove).toHaveBeenCalledWith(id);
  });
});
