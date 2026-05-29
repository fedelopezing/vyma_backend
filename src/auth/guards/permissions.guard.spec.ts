import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../roles/roles.service';
import {
  UnauthorizedException,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: createMock<Reflector>(),
        },
        {
          provide: RolesService,
          useValue: createMock<RolesService>(),
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no permissions required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMock<ExecutionContext>();
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if user not found in request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:users']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ user: null }),
      }),
    } as never);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException if user lacks permissions', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['read:users', 'write:users']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 1 } }),
      }),
    } as never);

    jest
      .spyOn(rolesService, 'getUserPermissions')
      .mockResolvedValue(['read:users']);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return true if user has all permissions', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['read:users', 'write:users']);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 1 } }),
      }),
    } as never);

    jest
      .spyOn(rolesService, 'getUserPermissions')
      .mockResolvedValue(['read:users', 'write:users', 'delete:users']);

    expect(await guard.canActivate(context)).toBe(true);
  });
});
