import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateUserWithProfileDto } from './dto';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { RolesService } from '../roles/roles.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: DeepMocked<ProfilesService>;

  beforeEach(async () => {
    profilesService = createMock<ProfilesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: profilesService },
        { provide: RolesService, useValue: createMock<RolesService>() },
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
    profilesService.createWithUser.mockResolvedValue(expectedResult as never);

    const result = await controller.create(dto);
    expect(profilesService.createWithUser).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});
