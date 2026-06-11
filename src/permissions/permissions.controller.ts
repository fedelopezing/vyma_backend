import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiFindAllPermissions } from './decorators/permissions-swagger.decorators';
import { PermissionsService } from './permissions.service';
import { AuthPermissions } from '../auth/decorators';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiFindAllPermissions()
  @AuthPermissions('read:users')
  findAll() {
    return this.permissionsService.findAll();
  }
}
