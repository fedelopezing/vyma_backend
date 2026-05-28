import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

import { ProfessionsService } from './professions.service';
import { CreateProfessionDto, UpdateProfessionDto } from './dto';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiBearerAuth()
@ApiTags('Professions')
@Controller('professions')
@UseGuards(AuthGuard('jwt'), UserRoleGuard)
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Post()
  @RoleProtected(ValidRoles.admin)
  create(@Body() createProfessionDto: CreateProfessionDto) {
    return this.professionsService.create(createProfessionDto);
  }

  @Get()
  findAll() {
    return this.professionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionsService.findOne(+id);
  }

  @Patch(':id')
  @RoleProtected(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateProfessionDto: UpdateProfessionDto,
  ) {
    return this.professionsService.update(+id, updateProfessionDto);
  }

  @Delete(':id')
  @RoleProtected(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.professionsService.remove(+id);
  }
}
