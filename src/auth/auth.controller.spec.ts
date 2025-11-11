import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ProfilesService } from '../profiles/profiles.service';
import { DataSource } from 'typeorm';

describe('AuthController', () => {
  let controller: AuthController;

  // Mock AuthService
  const mockAuthService = {
    create: jest.fn(),
    login: jest.fn(),
    getJwtToken: jest.fn().mockReturnValue('mock-jwt-token'),
    handleDBErrors: jest.fn(),
  };

  // Mock ProfilesService
  const mockProfilesService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock DataSource
  const mockDataSource = {
    transaction: jest.fn((callback) => callback({
      getRepository: jest.fn(),
    })),
    manager: {
      getRepository: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
