import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

import { AuthService } from './auth.service';
import {
  ApiActivateAccount,
  ApiLogin,
  ApiLogout,
  ApiRefreshTokens,
  ApiResendActivation,
  ApiSelectCompany,
} from './decorators';
import {
  ActivateAccountDto,
  LoginUserDto,
  RefreshTokenDto,
  ResendActivationDto,
  SelectCompanyDto,
} from './dto';
import {
  LoginResponse,
  MessageResponse,
  SelectionResponse,
} from './interfaces';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiActivateAccount()
  async activate(
    @Body() activateAccountDto: ActivateAccountDto,
  ): Promise<MessageResponse> {
    return this.authService.activateAccount(activateAccountDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('resend-activation')
  @HttpCode(HttpStatus.OK)
  @ApiResendActivation()
  async resendActivation(
    @Body() resendActivationDto: ResendActivationDto,
  ): Promise<MessageResponse> {
    return this.authService.resendActivation(resendActivationDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Body() loginDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<LoginResponse | SelectionResponse> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('select-company')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiSelectCompany()
  async selectCompany(
    @Body() dto: SelectCompanyDto,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    const authHeader = req.headers.authorization ?? '';
    const selectionToken = authHeader.replace('Bearer ', '').trim();
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.selectCompany(
      selectionToken,
      dto,
      ipAddress,
      userAgent,
    );
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefreshTokens()
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      ipAddress,
      userAgent,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiLogout()
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<MessageResponse> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
