import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateService,
  ApiFindAllServices,
  ApiFindOneService,
  ApiUpdateService,
  ApiDeleteService,
} from './decorators/services-swagger.decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Auth, AuthRoles } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiCreateService()
  @AuthRoles(ValidRoles.admin)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @ApiFindAllServices()
  @Auth()
  @Get()
  findAll(@Query('name') name?: string) {
    return this.servicesService.findAll(name);
  }

  @ApiFindOneService()
  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @ApiUpdateService()
  @AuthRoles(ValidRoles.admin)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @ApiDeleteService()
  @AuthRoles(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
