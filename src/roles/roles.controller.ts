import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiFindAllRoles,
  ApiCreateRole,
  ApiUpdateRole,
} from './decorators/roles-swagger.decorators';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthPermissions } from '../auth/decorators';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiFindAllRoles()
  @AuthPermissions('read:users')
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @ApiCreateRole()
  @AuthPermissions('write:users')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Put(':id')
  @ApiUpdateRole()
  @AuthPermissions('write:users')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }
}
