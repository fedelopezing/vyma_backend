import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateProfile,
  ApiFindAllProfiles,
  ApiFindOneProfile,
  ApiUpdateProfile,
  ApiDeleteProfile,
} from './decorators/profiles-swagger.decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';

import { CreateProfileDto, UpdateProfileDto } from './dto';
import { ProfilesService } from './profiles.service';
import { Auth, AuthPermissions } from '../auth/decorators';
import { checkOwnershipOrAdmin } from '../common/helpers/ownership.helper';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @AuthPermissions('write:users')
  @ApiCreateProfile()
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  @AuthPermissions('read:users')
  @ApiFindAllProfiles()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  @AuthPermissions('read:users')
  @ApiFindOneProfile()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiUpdateProfile()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    const profile = await this.profilesService.findOne(id);
    checkOwnershipOrAdmin(user, profile.user.id);

    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @AuthPermissions('write:users')
  @ApiDeleteProfile()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}
