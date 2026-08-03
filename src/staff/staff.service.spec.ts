import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { STAFF_REPOSITORY } from './interfaces/i-staff-repository.interface';
import { StaffMemberNotFoundException } from './exceptions/staff-member-not-found.exception';

describe('StaffService', () => {
  let service: StaffService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByNationalIdAndCompany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn().mockResolvedValue([[], 0]),
      findById: jest.fn(),
      findByNationalIdAndCompany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: STAFF_REPOSITORY,
          useValue: repo,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a staff member', async () => {
      const mockStaff = { id: 1n, companyId: 1n, nationalId: '123' };
      repo.findById.mockResolvedValue(mockStaff);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw if not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(
        StaffMemberNotFoundException,
      );
    });
  });
});
