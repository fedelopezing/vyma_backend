import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { RolesService } from '../roles/roles.service';
import { createMock } from '@golevelup/ts-jest';
import { Permission } from './entities/permission.entity';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: createMock<PermissionsService>(),
        },
        {
          provide: RolesService,
          useValue: createMock<RolesService>(),
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all permissions', async () => {
    const permissions = [new Permission(), new Permission()];
    jest.spyOn(service, 'findAll').mockResolvedValue(permissions);
    expect(await controller.findAll()).toBe(permissions);
  });
});
