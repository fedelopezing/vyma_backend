import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '../../roles/enums/role.enum';
import { createMock } from '@golevelup/ts-jest';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: createMock<Reflector>(),
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMock<ExecutionContext>();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user is missing in request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.USER]);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ user: null }),
      }),
    } as never);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return true if user is super admin', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.USER]);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { isSuperAdmin: true },
        }),
      }),
    } as never);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user role is admin or ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.USER]);
    const context1 = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'admin' },
        }),
      }),
    } as never);
    expect(guard.canActivate(context1)).toBe(true);

    const context2 = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'ADMIN' },
        }),
      }),
    } as never);
    expect(guard.canActivate(context2)).toBe(true);
  });

  it('should return true if user single role matches required role (case insensitive)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['moderator']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'MODERATOR' },
        }),
      }),
    } as never);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user roles array contains required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['editor']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { roles: ['viewer', 'EDITOR'] },
        }),
      }),
    } as never);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if neither user role nor user roles array match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['editor']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'viewer', roles: ['guest'] },
        }),
      }),
    } as never);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false if user has no role and no roles defined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['editor']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: {},
        }),
      }),
    } as never);

    expect(guard.canActivate(context)).toBe(false);
  });
});
