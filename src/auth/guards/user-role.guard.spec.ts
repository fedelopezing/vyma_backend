import { ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { META_ROLES } from '../decorators/role-protected.decorator';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = createMock<Reflector>();
    guard = new UserRoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      const context = createMock<ExecutionContext>();
      jest.spyOn(reflector, 'get').mockReturnValue([]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(META_ROLES, context.getHandler());
    });

    it('should return true if validRoles is undefined', () => {
      const context = createMock<ExecutionContext>();
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw BadRequestException if user is not found in request', () => {
      const context = createMock<ExecutionContext>();
      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
      
      const mockRequest = { user: undefined };
      context.switchToHttp().getRequest.mockReturnValue(mockRequest);

      expect(() => guard.canActivate(context)).toThrow(BadRequestException);
      expect(() => guard.canActivate(context)).toThrow('El usuario no existe');
    });

    it('should return true if user role matches one of the valid roles', () => {
      const context = createMock<ExecutionContext>();
      jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'user']);
      
      const mockRequest = { 
        user: { 
          name: faker.person.fullName(),
          role: { name: 'admin' } 
        } 
      };
      context.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user role does not match valid roles', () => {
      const context = createMock<ExecutionContext>();
      const validRoles = ['admin'];
      jest.spyOn(reflector, 'get').mockReturnValue(validRoles);
      
      const userName = faker.person.fullName();
      const mockRequest = { 
        user: { 
          name: userName,
          role: { name: 'user' } 
        } 
      };
      context.switchToHttp().getRequest.mockReturnValue(mockRequest);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(`${userName} no tiene el rol: [${validRoles}]`);
    });
  });
});
