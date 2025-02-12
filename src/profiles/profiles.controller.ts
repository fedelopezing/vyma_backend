import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSource } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { CreateUserWithProfileDto, UpdateProfileDto } from './dto';
import { ProfilesService } from './profiles.service';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { ValidRoles } from '../auth/interfaces';

@Controller('profiles')
@UseGuards(AuthGuard('jwt') )
export class ProfilesController {
  constructor(
    private readonly authService: AuthService,
    private readonly profilesService: ProfilesService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  @RoleProtected(ValidRoles.admin)
  @UseGuards(UserRoleGuard)
  async create(@Body() createUserDto: CreateUserWithProfileDto)
  {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Create the user
        const userCreated = await this.authService.create(createUserDto, manager);

        // Create the profile
        const profileDto = { userId: userCreated.id, professionId: createUserDto.professionId };
        const profileCreate = await this.profilesService.create(profileDto, manager);

        return { user: userCreated, profile: profileCreate };

      } catch (error) {
        this.authService.handleDBErrors(error);
      }
    });
  }

  @Get()
  @RoleProtected(ValidRoles.admin)
  @UseGuards(UserRoleGuard)
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(+id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profilesService.remove(+id);
  }
}
