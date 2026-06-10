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
});
