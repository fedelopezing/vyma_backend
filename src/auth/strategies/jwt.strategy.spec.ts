import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: UsersService;

  beforeEach(async () => {
    // ConfigService mock returning a dummy secret so JwtStrategy super() doesn't fail
    const mockConfigService = createMock<ConfigService>();
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'secret';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    mockUsersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if user exists and is active', async () => {
      const payload: JwtPayload = { id: faker.number.int() };
      const expectedUser = createMock<User>({
        id: payload.id,
        isActive: true,
      });

      jest
        .spyOn(mockUsersService, 'findOneById')
        .mockResolvedValue(expectedUser);

      const result = await strategy.validate(payload);

      expect(mockUsersService.findOneById).toHaveBeenCalledWith(payload.id);
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload: JwtPayload = { id: faker.number.int() };

      jest.spyOn(mockUsersService, 'findOneById').mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Token not valid',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const payload: JwtPayload = { id: faker.number.int() };
      const inactiveUser = createMock<User>({
        id: payload.id,
        isActive: false,
      });

      jest
        .spyOn(mockUsersService, 'findOneById')
        .mockResolvedValue(inactiveUser);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User is inactive, talk with an admin',
      );
    });
  });
});
