import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleAccessGuard } from './module-access.guard';
import { CompanyModule } from '../constants/modules.enum';

function createMockExecutionContext(
  user: Record<string, unknown> | undefined,
  activeModules?: string[],
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, activeModules }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('ModuleAccessGuard', () => {
  let guard: ModuleAccessGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleAccessGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ModuleAccessGuard>(ModuleAccessGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return true if no required modules are metadata-configured', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockExecutionContext({ sub: 10 });
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should return true if user is superadmin', () => {
    reflector.getAllAndOverride.mockReturnValue([CompanyModule.NEWS]);
    const ctx = createMockExecutionContext({ sub: 1, isSuperAdmin: true }, []);
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should return true if company has the required modules active', () => {
    reflector.getAllAndOverride.mockReturnValue([
      CompanyModule.NEWS,
      CompanyModule.ADS,
    ]);
    const ctx = createMockExecutionContext({ sub: 10, isSuperAdmin: false }, [
      'NEWS',
      'ADS',
      'EVENTS',
    ]);
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if company is missing a required module', () => {
    reflector.getAllAndOverride.mockReturnValue([
      CompanyModule.NEWS,
      CompanyModule.ADS,
    ]);
    const ctx = createMockExecutionContext({ sub: 10, isSuperAdmin: false }, [
      'NEWS',
      'EVENTS',
    ]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
