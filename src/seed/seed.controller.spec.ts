import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RolesService } from '../roles/roles.service';

describe('SeedController', () => {
  let controller: SeedController;
  let mockSeedService: DeepMocked<SeedService>;

  beforeEach(async () => {
    mockSeedService = createMock<SeedService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [
        {
          provide: SeedService,
          useValue: mockSeedService,
        },
        {
          provide: RolesService,
          useValue: createMock<RolesService>(),
        },
      ],
    }).compile();

    controller = module.get<SeedController>(SeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should execute seed successfully', async () => {
    const expectedResult = { message: 'Seed executed successfully' };
    mockSeedService.executeSeed.mockResolvedValue(expectedResult as never);

    expect(await controller.execute()).toEqual(expectedResult);
    expect(mockSeedService.executeSeed).toHaveBeenCalled();
  });
});
