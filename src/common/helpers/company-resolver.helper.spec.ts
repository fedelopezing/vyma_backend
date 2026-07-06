import { BadRequestException, NotFoundException } from '@nestjs/common';
import { resolveActiveCompany } from './company-resolver.helper';
import { Company } from '../../companies/entities/company.entity';

describe('resolveActiveCompany', () => {
  let mockCompaniesRepository: { findByUuid: jest.Mock };

  beforeEach(() => {
    mockCompaniesRepository = {
      findByUuid: jest.fn(),
    };
  });

  it('should throw BadRequestException if companyUuid is not provided', async () => {
    await expect(
      resolveActiveCompany('', mockCompaniesRepository),
    ).rejects.toThrow(BadRequestException);
    expect(mockCompaniesRepository.findByUuid).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if company is not found', async () => {
    mockCompaniesRepository.findByUuid.mockResolvedValueOnce(null);

    await expect(
      resolveActiveCompany('invalid-uuid', mockCompaniesRepository),
    ).rejects.toThrow(NotFoundException);
    expect(mockCompaniesRepository.findByUuid).toHaveBeenCalledWith(
      'invalid-uuid',
    );
  });

  it('should throw NotFoundException if company is inactive', async () => {
    const inactiveCompany = { id: 1, isActive: false } as Company;
    mockCompaniesRepository.findByUuid.mockResolvedValueOnce(inactiveCompany);

    await expect(
      resolveActiveCompany('inactive-uuid', mockCompaniesRepository),
    ).rejects.toThrow(NotFoundException);
    expect(mockCompaniesRepository.findByUuid).toHaveBeenCalledWith(
      'inactive-uuid',
    );
  });

  it('should return the company if it is found and active', async () => {
    const activeCompany = { id: 1, isActive: true } as Company;
    mockCompaniesRepository.findByUuid.mockResolvedValueOnce(activeCompany);

    const result = await resolveActiveCompany(
      'active-uuid',
      mockCompaniesRepository,
    );

    expect(result).toBe(activeCompany);
    expect(mockCompaniesRepository.findByUuid).toHaveBeenCalledWith(
      'active-uuid',
    );
  });
});
