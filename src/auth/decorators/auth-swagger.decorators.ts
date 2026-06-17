import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiActivateAccount() {
  return applyDecorators(
    ApiOperation({ summary: 'Activate account using activation token' }),
    ApiResponse({
      status: 200,
      description: 'Account activated successfully.',
    }),
    ApiResponse({ status: 400, description: 'Token invalid or expired.' }),
  );
}

export function ApiResendActivation() {
  return applyDecorators(
    ApiOperation({ summary: 'Resend account activation email' }),
    ApiResponse({
      status: 200,
      description: 'Activation email sent if registered.',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login — returns JWT or selection token for multi-company users',
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful. Returns JWT or requiresCompanySelection.',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials or no company memberships.',
    }),
  );
}

export function ApiSelectCompany() {
  return applyDecorators(
    ApiOperation({
      summary: 'Select active company from multi-tenant login (Case B)',
    }),
    ApiResponse({
      status: 200,
      description: 'JWT with companyId emitted for selected company.',
    }),
    ApiResponse({
      status: 401,
      description: 'Selection token invalid or expired.',
    }),
    ApiResponse({
      status: 403,
      description: 'User is not a member of the selected company.',
    }),
  );
}

export function ApiRefreshTokens() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token using refresh token' }),
    ApiResponse({ status: 200, description: 'New tokens issued.' }),
    ApiResponse({
      status: 401,
      description: 'Invalid, expired or revoked refresh token.',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'Logout — revokes refresh token' }),
    ApiResponse({ status: 200, description: 'Logged out successfully.' }),
  );
}
