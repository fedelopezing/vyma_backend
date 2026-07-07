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

  it('should throw BadRequestException if companyUuid is not a valid UUID format', async () => {
    await expect(
      resolveActiveCompany('invalid-uuid-format', mockCompaniesRepository),
    ).rejects.toThrow(BadRequestException);
    expect(mockCompaniesRepository.findByUuid).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if company is not found', async () => {
    mockCompaniesRepository.findByUuid.mockResolvedValueOnce(null);
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    await expect(
      resolveActiveCompany(validUuid, mockCompaniesRepository),
    ).rejects.toThrow(NotFoundException);
    expect(mockCompaniesRepository.findByUuid).toHaveBeenCalledWith(validUuid);
  });

  it('should throw NotFoundException if company is inactive', async () => {
    const inactiveCompany = { id: 1, isActive: false } as Company;
    mockCompaniesRepository.findByUuid.mockResolvedValueOnce(inactiveCompany);
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

    await expect(
      resolveActiveCompany(validUuid, mockCompaniesRepository),
    ).rejects.toThrow(NotFoundException);
    expect(mockCompaniesRepository.findByUuid).toHaveBeenCalledWith(validUuid);
  });

  it('should return the company if it is found and active', async () => {
    const activeCompany = { id: 1, isActive: true } as Company;
    mockCompaniesRepository.findByUuid.mockResolvedValueOnce(activeCompany);
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

    const result = await resolveActiveCompany(
      validUuid,
      mockCompaniesRepository,
    );

    expect(result).toBe(activeCompany);
    expect(mockCompaniesRepository.findByUuid).toHaveBeenCalledWith(validUuid);
  });
});
