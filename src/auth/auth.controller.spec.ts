import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

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
    }).compile();

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
        access_token: faker.string.alphanumeric(32),
        user: { id: faker.number.int(), email: dto.email },
      };
      mockAuthService.login.mockResolvedValue(expectedResult as never);

      const req = { ip: '127.0.0.1', headers: { 'user-agent': 'test' } } as any;
      expect(await controller.login(dto, req)).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
