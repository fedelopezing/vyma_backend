import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { ProfilesService } from '../profiles/profiles.service';
import { DataSource } from 'typeorm';
import { CreateUserWithProfileDto } from '../profiles/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfilesService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('register')

  async create(@Body() createUserDto: CreateUserWithProfileDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Create user
        createUserDto.role = 'client';
        const user = await this.authService.create(createUserDto, manager);

        // Create profile to attach to user
        await this.profileService.create({ userId: user.id }, manager);

        return {
          user,
          token: this.authService.getJwtToken({ id: user.id }),
        };
      } catch (error) {
        this.authService.handleDBErrors(error);
      }
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }
}
