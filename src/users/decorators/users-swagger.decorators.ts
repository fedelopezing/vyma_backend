import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user (admin only)' }),
    ApiResponse({
      status: 201,
      description: 'User created and activation email sent',
    }),
    ApiResponse({ status: 409, description: 'Email already in use' }),
  );
}
