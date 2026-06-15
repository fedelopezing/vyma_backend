import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let mockService: DeepMocked<SchedulesService>;

  const mockReq = {
    user: {
      companyId: 2,
    },
  };

  beforeEach(async () => {
    mockService = createMock<SchedulesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [
        {
          provide: SchedulesService,
          useValue: mockService,
        },
        {
          provide: UserCompanyRepository,
          useValue: { isActiveMember: jest.fn().mockResolvedValue(true) },
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
    mockService.create.mockReturnValue(expectedResult as never);

    expect(controller.create({} as never, mockReq as never)).toBe(
      expectedResult,
    );
    expect(mockService.create).toHaveBeenCalledWith({}, 2);
  });

  it('should return all schedules', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.findAll.mockReturnValue(expectedResult as never);

    expect(controller.findAll(mockReq as never)).toBe(expectedResult);
    expect(mockService.findAll).toHaveBeenCalledWith(2);
  });

  it('should return a schedule by id', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.findOne.mockReturnValue(expectedResult as never);

    expect(controller.findOne('1', mockReq as never)).toBe(expectedResult);
    expect(mockService.findOne).toHaveBeenCalledWith(1, 2);
  });

  it('should update a schedule', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.update.mockReturnValue(expectedResult as never);

    expect(controller.update('1', {} as never, mockReq as never)).toBe(
      expectedResult,
    );
    expect(mockService.update).toHaveBeenCalledWith(1, {}, 2);
  });

  it('should remove a schedule', () => {
    const expectedResult = faker.lorem.sentence();
    mockService.remove.mockReturnValue(expectedResult as never);

    expect(controller.remove('1', mockReq as never)).toBe(expectedResult);
    expect(mockService.remove).toHaveBeenCalledWith(1, 2);
  });
});
