import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleBreaksController } from './schedule-breaks.controller';
import { ScheduleBreaksService } from './schedule-breaks.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('ScheduleBreaksController', () => {
  let controller: ScheduleBreaksController;
  let mockService: DeepMocked<ScheduleBreaksService>;

  beforeEach(async () => {
    mockService = createMock<ScheduleBreaksService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleBreaksController],
      providers: [
        {
          provide: ScheduleBreaksService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleBreaksController>(ScheduleBreaksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a scheduleBreak', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.create.mockReturnValue(expectedResult as never);

    expect(controller.create({} as never)).toBe(expectedResult);
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should return all scheduleBreaks', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.findAll.mockReturnValue(expectedResult as never);

    expect(controller.findAll()).toBe(expectedResult);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should return a scheduleBreak by id', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.findOne.mockReturnValue(expectedResult as never);

    expect(controller.findOne('1')).toBe(expectedResult);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a scheduleBreak', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.update.mockReturnValue(expectedResult as never);

    expect(controller.update('1', {} as never)).toBe(expectedResult);
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('should remove a scheduleBreak', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.remove.mockReturnValue(expectedResult as never);

    expect(controller.remove('1')).toBe(expectedResult);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
