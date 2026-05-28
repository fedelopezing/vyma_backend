import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let mockService: DeepMocked<SchedulesService>;

  beforeEach(async () => {
    mockService = createMock<SchedulesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [
        {
          provide: SchedulesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SchedulesController>(SchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a schedule', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.create.mockReturnValue(expectedResult as any);

    expect(controller.create({} as any)).toBe(expectedResult);
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should return all schedules', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.findAll.mockReturnValue(expectedResult as any);

    expect(controller.findAll()).toBe(expectedResult);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should return a schedule by id', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.findOne.mockReturnValue(expectedResult as any);

    expect(controller.findOne('1')).toBe(expectedResult);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a schedule', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.update.mockReturnValue(expectedResult as any);

    expect(controller.update('1', {} as any)).toBe(expectedResult);
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('should remove a schedule', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.remove.mockReturnValue(expectedResult as any);

    expect(controller.remove('1')).toBe(expectedResult);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
