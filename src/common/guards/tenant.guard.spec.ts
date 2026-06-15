import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { TenantGuard } from './tenant.guard';
import { UserCompanyRepository } from '../../companies/repositories/user-company.repository';

/**
 * Helper to create a mock ExecutionContext with the given user.
 */
function createMockExecutionContext(
  user: Record<string, unknown>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let userCompanyRepository: jest.Mocked<UserCompanyRepository>;

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
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    userCompanyRepository = module.get(UserCompanyRepository);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── SuperAdmin bypass ────────────────────────────────────────────────────

  it('should return true for superadmin without calling isActiveMember', async () => {
    const ctx = createMockExecutionContext({
      sub: 1,
      companyId: 5,
      isSuperAdmin: true,
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(userCompanyRepository.isActiveMember).not.toHaveBeenCalled();
  });

  // ─── Active member ────────────────────────────────────────────────────────

  it('should return true when user is an active member of their company', async () => {
    userCompanyRepository.isActiveMember.mockResolvedValue(true);

    const ctx = createMockExecutionContext({
      sub: 10,
      companyId: 3,
      isSuperAdmin: false,
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(userCompanyRepository.isActiveMember).toHaveBeenCalledWith(10, 3);
  });

  // ─── Non-member ───────────────────────────────────────────────────────────

  it('should throw ForbiddenException when user is not a member', async () => {
    userCompanyRepository.isActiveMember.mockResolvedValue(false);

    const ctx = createMockExecutionContext({
      sub: 10,
      companyId: 99,
      isSuperAdmin: false,
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(userCompanyRepository.isActiveMember).toHaveBeenCalledWith(10, 99);
  });

  // ─── Missing companyId ────────────────────────────────────────────────────

  it('should throw ForbiddenException when companyId is missing from JWT', async () => {
    const ctx = createMockExecutionContext({
      sub: 10,
      companyId: undefined,
      isSuperAdmin: false,
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(userCompanyRepository.isActiveMember).not.toHaveBeenCalled();
  });
});
