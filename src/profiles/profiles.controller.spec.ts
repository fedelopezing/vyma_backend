import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto';
import { Profile } from './entities/profile.entity';
import { Request } from 'express';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RolesService } from '../roles/roles.service';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

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

  describe('update', () => {
    it('should update profile if user is the owner', async () => {
      const dto = new UpdateProfileDto();
      const mockUser = { id: 1, role: { name: 'user' } } as User;
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
      const mockUser = { id: 2, role: { name: 'admin' } } as User;
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
      const mockUser = { id: 2, role: { name: 'user' } } as User;
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
});
