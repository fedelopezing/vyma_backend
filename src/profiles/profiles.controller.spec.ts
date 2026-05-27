import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateUserWithProfileDto } from './dto';
import { AuthService } from '../auth/auth.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let authService: jest.Mocked<Partial<AuthService>>;
  let profilesService: jest.Mocked<Partial<ProfilesService>>;

  beforeEach(async () => {
    profilesService = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    authService = {
      registerWithProfile: jest.fn().mockResolvedValue({
        user: {},
        profile: {},
        token: 'token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: profilesService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should create a profile with user transaction', async () => {
    const dto = new CreateUserWithProfileDto();
    const result = await controller.create(dto);
    expect(authService.registerWithProfile).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('user');
  });
});
