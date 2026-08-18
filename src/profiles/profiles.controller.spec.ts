import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { Profile } from './entities/profile.entity';
import { Request } from 'express';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RolesService } from '../roles/roles.service';
import { ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

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

  describe('create', () => {
    it('should create a profile', async () => {
      const dto = new CreateProfileDto();
      profilesService.create.mockResolvedValue({ id: 1 } as unknown as Profile);

      const result = await controller.create(dto);
      expect(profilesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('should return all profiles', async () => {
      profilesService.findAll.mockResolvedValue([
        { id: 1 },
      ] as unknown as Profile[]);

      const result = await controller.findAll();
      expect(profilesService.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return a single profile', async () => {
      profilesService.findOne.mockResolvedValue({
        id: 1,
      } as unknown as Profile);

      const result = await controller.findOne(1);
      expect(profilesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should update profile if user is the owner', async () => {
      const dto = new UpdateProfileDto();
      const mockUser: JwtPayload = {
        sub: 1,
        uuid: 'uuid-1',
        email: 'test@example.com',
        role: 'user',
        isSuperAdmin: false,
      };
      const req = { user: mockUser } as unknown as Request;

      profilesService.findOne.mockResolvedValue({
        user: { id: 1 },
      } as Profile);

      profilesService.update.mockResolvedValue({ id: 1 } as Profile);

      const result = await controller.update(1, dto, req);

      expect(profilesService.findOne).toHaveBeenCalledWith(1);
      expect(profilesService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1 });
    });

    it('should update profile if user is admin', async () => {
      const dto = new UpdateProfileDto();
      const mockUser: JwtPayload = {
        sub: 2,
        uuid: 'uuid-2',
        email: 'admin@example.com',
        role: 'admin',
        isSuperAdmin: false,
      };
      const req = { user: mockUser } as unknown as Request;

      profilesService.findOne.mockResolvedValue({
        user: { id: 1 },
      } as Profile);

      profilesService.update.mockResolvedValue({ id: 1 } as Profile);

      await controller.update(1, dto, req);

      expect(profilesService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw ForbiddenException if user is not owner and not admin', async () => {
      const dto = new UpdateProfileDto();
      const mockUser: JwtPayload = {
        sub: 2,
        uuid: 'uuid-2',
        email: 'user2@example.com',
        role: 'user',
        isSuperAdmin: false,
      };
      const req = { user: mockUser } as unknown as Request;

      profilesService.findOne.mockResolvedValue({
        user: { id: 1 },
      } as Profile);

      await expect(controller.update(1, dto, req)).rejects.toThrow(
        ForbiddenException,
      );

      expect(profilesService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove profile', async () => {
      profilesService.remove.mockResolvedValue(undefined as never);

      await controller.remove(1);
      expect(profilesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
