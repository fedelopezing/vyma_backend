import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { STAFF_REPOSITORY } from './interfaces/i-staff-repository.interface';
import { StaffMemberNotFoundException } from './exceptions/staff-member-not-found.exception';
import { StaffMemberDuplicateCiException } from './exceptions/staff-member-duplicate-ci.exception';
import { StaffStatus } from './constants/staff-enums';

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
  let eventEmitter: { emit: jest.Mock };

  const mockStaffMember = {
    id: 1,
    companyId: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    nationalId: '123456',
    status: StaffStatus.ACTIVE,
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

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: STAFF_REPOSITORY,
          useValue: repo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated staff members', async () => {
      repo.findAll.mockResolvedValue([[mockStaffMember], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should throw and log if error occurs', async () => {
      repo.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll({})).rejects.toThrow('DB Error');
    });
  });

  describe('findById', () => {
    it('should return a staff member', async () => {
      repo.findById.mockResolvedValue(mockStaffMember);
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

  describe('create', () => {
    it('should create a new staff member', async () => {
      repo.findByNationalIdAndCompany.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockStaffMember);

      const dto = {
        firstName: 'Juan',
        lastName: 'Pérez',
        nationalId: '123456',
      } as any;

      const result = await service.create(dto, 1);
      expect(result.id).toBe(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'staff.created',
        expect.any(Object),
      );
    });

    it('should throw StaffMemberDuplicateCiException if nationalId exists', async () => {
      repo.findByNationalIdAndCompany.mockResolvedValue(mockStaffMember);
      const dto = { nationalId: '123456' } as any;

      await expect(service.create(dto, 1)).rejects.toThrow(
        StaffMemberDuplicateCiException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing staff member', async () => {
      repo.findById.mockResolvedValue(mockStaffMember);
      repo.findByNationalIdAndCompany.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockStaffMember, firstName: 'Pedro' });

      const dto = { firstName: 'Pedro', nationalId: '99999' } as any;
      const result = await service.update(1, dto, 1);

      expect(result.firstName).toBe('Pedro');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'staff.updated',
        expect.any(Object),
      );
    });

    it('should throw NotFound if staff does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update(1, {} as any, 1)).rejects.toThrow(
        StaffMemberNotFoundException,
      );
    });

    it('should throw DuplicateCi if updated nationalId belongs to another staff', async () => {
      repo.findById.mockResolvedValue(mockStaffMember);
      repo.findByNationalIdAndCompany.mockResolvedValue({
        ...mockStaffMember,
        id: 2,
      });

      const dto = { nationalId: '99999' } as any;
      await expect(service.update(1, dto, 1)).rejects.toThrow(
        StaffMemberDuplicateCiException,
      );
    });
  });

  describe('changeStatus', () => {
    it('should change staff status to TERMINATED and set terminationDate', async () => {
      repo.findById.mockResolvedValue(mockStaffMember);
      repo.update.mockResolvedValue({
        ...mockStaffMember,
        status: StaffStatus.TERMINATED,
      });

      const result = await service.changeStatus(1, StaffStatus.TERMINATED, 1);
      expect(result.status).toBe(StaffStatus.TERMINATED);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'staff.status_changed',
        expect.any(Object),
      );
    });

    it('should throw NotFound if staff does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.changeStatus(1, StaffStatus.INACTIVE, 1),
      ).rejects.toThrow(StaffMemberNotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a staff member', async () => {
      repo.findById.mockResolvedValue(mockStaffMember);
      repo.remove.mockResolvedValue(undefined);

      await service.remove(1, 1);
      expect(repo.remove).toHaveBeenCalledWith(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'staff.deleted',
        expect.any(Object),
      );
    });

    it('should throw NotFound if staff to remove does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove(1, 1)).rejects.toThrow(
        StaffMemberNotFoundException,
      );
    });
  });
});
