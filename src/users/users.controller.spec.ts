import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConflictException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    mockUsersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create and return exactly mapped fields', async () => {
      const dto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        roleId: 1,
      };

      const date = new Date();
      const mockUser = {
        uuid: 'test-uuid',
        name: 'Test User',
        email: 'test@example.com',
        isActive: false,
        role: { id: 1, name: 'admin' },
        createdAt: date,
        passwordHash: 'hidden',
        id: 1,
        updatedAt: date,
      } as User;

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        uuid: mockUser.uuid,
        name: mockUser.name,
        email: mockUser.email,
        isActive: mockUser.isActive,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      });
      // Ensure no extra fields like passwordHash leaked
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('id');
    });

    it('should propagate ConflictException when email is duplicated', async () => {
      const dto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        roleId: 1,
      };

      mockUsersService.create.mockRejectedValue(
        new ConflictException('A user with this email already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
