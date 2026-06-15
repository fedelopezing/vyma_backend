import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: DeepMocked<AuthService>;

  beforeEach(async () => {
    mockAuthService = createMock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const dto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const expectedResult = {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
        expiresIn: 900,
        user: {
          uuid: faker.string.uuid(),
          email: dto.email,
          name: faker.person.fullName(),
        },
      };
      mockAuthService.login.mockResolvedValue(expectedResult as never);

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test' },
      } as unknown as Request;
      expect(await controller.login(dto, req)).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto,
        '127.0.0.1',
        'test',
      );
    });
  });

  describe('activate', () => {
    it('should activate user account', async () => {
      const dto = {
        token: faker.string.uuid(),
        password: 'Password123!',
      };
      const expectedResult = { message: 'Account activated successfully' };
      mockAuthService.activateAccount.mockResolvedValue(expectedResult);

      expect(await controller.activate(dto)).toEqual(expectedResult);
      expect(mockAuthService.activateAccount).toHaveBeenCalledWith(dto);
    });
  });

  describe('resendActivation', () => {
    it('should request resending activation email', async () => {
      const dto = { email: faker.internet.email() };
      const expectedResult = {
        message:
          'Si el correo electrónico está registrado, se enviará un enlace de activación',
      };
      mockAuthService.resendActivation.mockResolvedValue(expectedResult);

      expect(await controller.resendActivation(dto)).toEqual(expectedResult);
      expect(mockAuthService.resendActivation).toHaveBeenCalledWith(dto);
    });
  });

  describe('selectCompany', () => {
    it('should call authService.selectCompany with token, dto, ip and userAgent', async () => {
      const dto = { companyUuid: faker.string.uuid() };
      const expectedResult = {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
        expiresIn: 900,
      };
      mockAuthService.selectCompany.mockResolvedValue(expectedResult as never);

      const req = {
        headers: {
          authorization: 'Bearer selection-token',
          'user-agent': 'test-agent',
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      expect(await controller.selectCompany(dto, req)).toEqual(expectedResult);
      expect(mockAuthService.selectCompany).toHaveBeenCalledWith(
        'selection-token',
        dto,
        '127.0.0.1',
        'test-agent',
      );
    });

    it('should handle missing auth header', async () => {
      const dto = { companyUuid: faker.string.uuid() };
      mockAuthService.selectCompany.mockResolvedValue({} as never);
      const req = {
        headers: {},
        ip: '127.0.0.1',
      } as unknown as Request;
      await controller.selectCompany(dto, req);
      expect(mockAuthService.selectCompany).toHaveBeenCalledWith(
        '',
        dto,
        '127.0.0.1',
        undefined,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const dto = { refreshToken: 'ref-token-123' };
      const expectedResult = {
        accessToken: 'new-acc',
        refreshToken: 'new-ref',
        expiresIn: 900,
      };
      mockAuthService.refreshTokens.mockResolvedValue(expectedResult as never);
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      } as unknown as Request;

      expect(await controller.refresh(dto, req)).toEqual(expectedResult);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'ref-token-123',
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const dto = { refreshToken: 'ref-token-123' };
      const expectedResult = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(expectedResult);

      expect(await controller.logout(dto)).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalledWith('ref-token-123');
    });
  });
});
