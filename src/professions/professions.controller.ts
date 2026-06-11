import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateProfession,
  ApiFindAllProfessions,
  ApiFindOneProfession,
  ApiUpdateProfession,
  ApiDeleteProfession,
} from './decorators/professions-swagger.decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ProfessionsService } from './professions.service';
import { CreateProfessionDto, UpdateProfessionDto } from './dto';
import { Auth, AuthRoles } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Professions')
@Controller('professions')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Post()
  @ApiCreateProfession()
  @AuthRoles(ValidRoles.admin)
  create(@Body() createProfessionDto: CreateProfessionDto) {
    return this.professionsService.create(createProfessionDto);
  }

  @ApiFindAllProfessions()
  @Auth()
  @Get()
  findAll() {
    return this.professionsService.findAll();
  }

  @ApiFindOneProfession()
  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiUpdateProfession()
  @AuthRoles(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateProfessionDto: UpdateProfessionDto,
  ) {
    return this.professionsService.update(+id, updateProfessionDto);
  }

  @Delete(':id')
  @ApiDeleteProfession()
  @AuthRoles(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.professionsService.remove(+id);
  }
}
