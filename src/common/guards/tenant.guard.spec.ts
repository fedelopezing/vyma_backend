import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { TenantGuard } from './tenant.guard';
import { UserCompanyRepository } from '../../companies/repositories/user-company.repository';
import { CompaniesRepository } from '../../companies/repositories/companies.repository';

/**
 * Helper to create a mock ExecutionContext with the given user and headers.
 */
function createMockExecutionContext(
  user: Record<string, unknown> | undefined,
  headers: Record<string, string> = {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let userCompanyRepository: jest.Mocked<UserCompanyRepository>;
  let companiesRepository: jest.Mocked<CompaniesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: UserCompanyRepository,
          useValue: {
            isActiveMember: jest.fn(),
          },
        },
        {
          provide: CompaniesRepository,
          useValue: {
            findByUuid: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    userCompanyRepository = module.get(UserCompanyRepository);
    companiesRepository = module.get(CompaniesRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw ForbiddenException if user is not authenticated', async () => {
    const ctx = createMockExecutionContext(undefined, {
      'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new ForbiddenException('User is not authenticated'),
    );
  });

  // ─── SuperAdmin bypass ────────────────────────────────────────────────────

  it('should return true for superadmin without calling isActiveMember, but calling findByUuid', async () => {
    companiesRepository.findByUuid.mockResolvedValue({
      id: 5,
      isActive: true,
      activeModules: ['NEWS'],
    } as any);
    const ctx = createMockExecutionContext(
      { sub: 1, isSuperAdmin: true },
      { 'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    );

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(userCompanyRepository.isActiveMember).not.toHaveBeenCalled();
    expect(companiesRepository.findByUuid).toHaveBeenCalledWith(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    );
  });

  it('should attach empty array for activeModules if company.activeModules is undefined', async () => {
    const mockRequest: Record<string, any> = {
      user: { sub: 1, isSuperAdmin: true },
      headers: { 'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    companiesRepository.findByUuid.mockResolvedValue({
      id: 5,
      isActive: true,
    } as any);

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockRequest.activeModules).toEqual([]);
  });

  // ─── Active member ────────────────────────────────────────────────────────

  it('should return true when user is an active member of the company', async () => {
    userCompanyRepository.isActiveMember.mockResolvedValue(true);
    companiesRepository.findByUuid.mockResolvedValue({
      id: 3,
      isActive: true,
      activeModules: ['NEWS'],
    } as any);

    const ctx = createMockExecutionContext(
      { sub: 10, isSuperAdmin: false },
      { 'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' },
    );

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(userCompanyRepository.isActiveMember).toHaveBeenCalledWith(10, 3);
    expect(companiesRepository.findByUuid).toHaveBeenCalledWith(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    );
  });

  // ─── Non-member ───────────────────────────────────────────────────────────

  it('should throw ForbiddenException when user is not a member', async () => {
    companiesRepository.findByUuid.mockResolvedValue({
      id: 99,
      isActive: true,
      activeModules: ['NEWS'],
    } as any);
    userCompanyRepository.isActiveMember.mockResolvedValue(false);

    const ctx = createMockExecutionContext(
      { sub: 10, isSuperAdmin: false },
      { 'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99' },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(userCompanyRepository.isActiveMember).toHaveBeenCalledWith(10, 99);
    expect(companiesRepository.findByUuid).toHaveBeenCalledWith(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    );
  });

  // ─── Missing X-Company-Id header ─────────────────────────────────────────

  it('should throw BadRequestException when X-Company-Id header is missing', async () => {
    const ctx = createMockExecutionContext(
      { sub: 10, isSuperAdmin: false },
      {},
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
    expect(userCompanyRepository.isActiveMember).not.toHaveBeenCalled();
  });

  // ─── Invalid X-Company-Id header ─────────────────────────────────────────

  it('should throw BadRequestException when X-Company-Id header is not a valid UUID', async () => {
    const ctx = createMockExecutionContext(
      { sub: 10, isSuperAdmin: false },
      { 'x-company-id': 'invalid' },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
    expect(userCompanyRepository.isActiveMember).not.toHaveBeenCalled();
  });

  // ─── Inactive or Not Found Company ────────────────────────────────────────

  it('should throw ForbiddenException when company is not found', async () => {
    companiesRepository.findByUuid.mockResolvedValue(null);

    const ctx = createMockExecutionContext(
      { sub: 10, isSuperAdmin: false },
      { 'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when company is inactive', async () => {
    companiesRepository.findByUuid.mockResolvedValue({
      id: 3,
      isActive: false,
    } as any);

    const ctx = createMockExecutionContext(
      { sub: 10, isSuperAdmin: false },
      { 'x-company-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
