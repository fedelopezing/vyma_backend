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

@Controller('professions')
@UseGuards(AuthGuard('jwt'))
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Post()
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
  update(
    @Param('id') id: string,
    @Body() updateProfessionDto: UpdateProfessionDto,
  ) {
    return this.professionsService.update(+id, updateProfessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professionsService.remove(+id);
  }
}
