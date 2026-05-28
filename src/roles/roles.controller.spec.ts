import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { createMock } from '@golevelup/ts-jest';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: createMock<RolesService>(),
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all roles', async () => {
    const roles = [new Role(), new Role()];
    jest.spyOn(service, 'findAll').mockResolvedValue(roles);
    expect(await controller.findAll()).toBe(roles);
  });

  it('should create a role', async () => {
    const dto: CreateRoleDto = { name: 'admin', permissions: ['read'] };
    const role = new Role();
    jest.spyOn(service, 'create').mockResolvedValue(role);
    expect(await controller.create(dto)).toBe(role);
  });

  it('should update a role', async () => {
    const dto: UpdateRoleDto = { name: 'admin_updated' };
    const role = new Role();
    jest.spyOn(service, 'update').mockResolvedValue(role);
    expect(await controller.update(1, dto)).toBe(role);
  });
});
