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
import { Auth, AuthPermissions } from '../auth/decorators';

@ApiTags('Professions')
@Controller('professions')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Post()
  @ApiCreateProfession()
  @AuthPermissions('write:professions')
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
  @AuthPermissions('write:professions')
  update(
    @Param('id') id: string,
    @Body() updateProfessionDto: UpdateProfessionDto,
  ) {
    return this.professionsService.update(+id, updateProfessionDto);
  }

  @Delete(':id')
  @ApiDeleteProfession()
  @AuthPermissions('write:professions')
  remove(@Param('id') id: string) {
    return this.professionsService.remove(+id);
  }
}
