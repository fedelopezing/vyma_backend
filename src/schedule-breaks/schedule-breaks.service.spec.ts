import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleBreaksService } from './schedule-breaks.service';
import { faker } from '@faker-js/faker';

describe('ScheduleBreaksService', () => {
  let service: ScheduleBreaksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleBreaksService],
    }).compile();

    service = module.get<ScheduleBreaksService>(ScheduleBreaksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a scheduleBreak', () => {
    expect(service.create({} as any)).toBe(
      'This action adds a new scheduleBreak',
    );
  });

  it('should return all scheduleBreaks', () => {
    expect(service.findAll()).toBe('This action returns all scheduleBreaks');
  });

  it('should return a scheduleBreak by id', () => {
    const id = faker.number.int();
    expect(service.findOne(id)).toBe(
      `This action returns a #${id} scheduleBreak`,
    );
  });

  it('should update a scheduleBreak', () => {
    const id = faker.number.int();
    expect(service.update(id, {} as any)).toBe(
      `This action updates a #${id} scheduleBreak`,
    );
  });

  it('should remove a scheduleBreak', () => {
    const id = faker.number.int();
    expect(service.remove(id)).toBe(
      `This action removes a #${id} scheduleBreak`,
    );
  });
});
