import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import {
  LoginUserDto,
  ActivateAccountDto,
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
  @ApiOperation({ summary: 'Activate account using activation token' })
  @ApiResponse({ status: 200, description: 'Account activated successfully.' })
  @ApiResponse({ status: 400, description: 'Token invalid or expired.' })
  async activate(
    @Body() activateAccountDto: ActivateAccountDto,
  ): Promise<MessageResponse> {
    return this.authService.activateAccount(activateAccountDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('resend-activation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend account activation email' })
  @ApiResponse({
    status: 200,
    description: 'Activation email sent if registered.',
  })
  async resendActivation(
    @Body() resendActivationDto: ResendActivationDto,
  ): Promise<MessageResponse> {
    return this.authService.resendActivation(resendActivationDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login — returns JWT or selection token for multi-company users',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT or requiresCompanySelection.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or no company memberships.',
  })
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
  @ApiOperation({
    summary: 'Select active company from multi-tenant login (Case B)',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT with companyId emitted for selected company.',
  })
  @ApiResponse({
    status: 401,
    description: 'Selection token invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a member of the selected company.',
  })
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
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens issued.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired or revoked refresh token.',
  })
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
  @ApiOperation({ summary: 'Logout — revokes refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<MessageResponse> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
