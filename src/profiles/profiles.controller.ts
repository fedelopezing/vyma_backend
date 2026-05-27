import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserWithProfileDto, UpdateProfileDto } from './dto';
import { ProfilesService } from './profiles.service';
import { AuthService } from '../auth/auth.service';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { ValidRoles } from '../auth/interfaces';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @RoleProtected(ValidRoles.admin)
  @UseGuards(UserRoleGuard)
  async create(@Body() createUserDto: CreateUserWithProfileDto) {
    return this.authService.registerWithProfile(createUserDto);
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
