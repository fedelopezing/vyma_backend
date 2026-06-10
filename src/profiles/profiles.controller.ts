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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateProfileDto, UpdateProfileDto } from './dto';
import { ProfilesService } from './profiles.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

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
  @RequirePermissions('write:users')
  @ApiOperation({ summary: 'Actualizar un perfil por ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @RequirePermissions('write:users')
  @ApiOperation({ summary: 'Eliminar un perfil por ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}
