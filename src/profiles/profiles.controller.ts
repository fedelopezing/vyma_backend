import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

import { CreateProfileDto, UpdateProfileDto } from './dto';
import { ProfilesService } from './profiles.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { checkOwnershipOrAdmin } from '../common/helpers/ownership.helper';

@ApiBearerAuth()
@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @RequirePermissions('write:users')
  @ApiOperation({ summary: 'Crear un perfil (solo admin)' })
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  @RequirePermissions('read:users')
  @ApiOperation({ summary: 'Obtener todos los perfiles (solo admin)' })
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:users')
  @ApiOperation({ summary: 'Obtener un perfil por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un perfil por ID' })
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
  @RequirePermissions('write:users')
  @ApiOperation({ summary: 'Eliminar un perfil por ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}
