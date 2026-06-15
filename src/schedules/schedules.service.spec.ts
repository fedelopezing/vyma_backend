import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { faker } from '@faker-js/faker';

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesService],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a schedule', () => {
    expect(service.create({} as never, 1)).toBe(
      'This action adds a new schedule',
    );
  });

  it('should return all schedules', () => {
    expect(service.findAll(1)).toBe('This action returns all schedules');
  });

  it('should return a schedule by id', () => {
    const id = faker.number.int();
    expect(service.findOne(id, 1)).toBe(
      `This action returns a #${id} schedule`,
    );
  });

  it('should update a schedule', () => {
    const id = faker.number.int();
    expect(service.update(id, {} as never, 1)).toBe(
      `This action updates a #${id} schedule`,
    );
  });

  it('should remove a schedule', () => {
    const id = faker.number.int();
    expect(service.remove(id, 1)).toBe(`This action removes a #${id} schedule`);
  });
});
