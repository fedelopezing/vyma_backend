import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateUserWithProfileDto } from './dto';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: jest.Mocked<Partial<ProfilesService>>;

  beforeEach(async () => {
    profilesService = {
      createWithUserTransaction: jest.fn().mockResolvedValue({
        user: {},
        profile: {},
      }),
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [{ provide: ProfilesService, useValue: profilesService }],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should create a profile with user transaction', async () => {
    const dto = new CreateUserWithProfileDto();
    const result = await controller.create(dto);
    expect(profilesService.createWithUserTransaction).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('user');
  });
});
