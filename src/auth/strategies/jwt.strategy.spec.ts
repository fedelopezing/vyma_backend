import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: Repository<User>;

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
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(expectedUser);

      const result = await strategy.validate(payload);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.id },
        relations: ['role'],
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload: JwtPayload = { id: faker.number.int() };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

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

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(inactiveUser);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User is inactive, talk with an admin',
      );
    });
  });
});
