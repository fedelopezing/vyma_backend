import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto';
import { Auth, AuthPermissions } from '../auth/decorators';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCreateUser,
  ApiFindAllUsers,
} from './decorators/users-swagger.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth()
  @ApiFindAllUsers()
  async findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Only superadmin can list all users');
    }
    return this.usersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateUser()
  @AuthPermissions('write:users')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
