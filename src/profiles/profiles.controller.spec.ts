import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateUserWithProfileDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let authService: DeepMocked<AuthService>;
  let profilesService: DeepMocked<ProfilesService>;

  beforeEach(async () => {
    profilesService = createMock<ProfilesService>();
    authService = createMock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: profilesService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a profile with user transaction', async () => {
    const dto = new CreateUserWithProfileDto();
    dto.email = faker.internet.email();
    dto.name = faker.person.fullName();
    dto.password = faker.internet.password();

    const expectedResult = {
      user: { id: faker.number.int(), email: dto.email },
      profile: { id: faker.number.int() },
      token: faker.string.alphanumeric(32),
    };
    authService.registerWithProfile.mockResolvedValue(expectedResult as any);

    const result = await controller.create(dto);
    expect(authService.registerWithProfile).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});
