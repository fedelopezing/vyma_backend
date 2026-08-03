import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  StaffMemberResponseDto,
  PaginatedStaffResponseDto,
} from '../dto/staff-member-response.dto';
import { StaffStatus } from '../constants/staff-enums';

export const ApiGetStaffList = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get paginated staff members list' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Returns paginated staff list',
      type: PaginatedStaffResponseDto,
    }),
  );

export const ApiGetStaffMember = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a specific staff member by ID' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Staff Member ID', type: Number }),
    ApiOkResponse({
      description: 'Returns staff member detail',
      type: StaffMemberResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Staff member not found' }),
  );

export const ApiCreateStaffMember = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new staff member' }),
    ApiBearerAuth(),
    ApiCreatedResponse({
      description: 'Staff member created successfully',
      type: StaffMemberResponseDto,
    }),
    ApiConflictResponse({
      description: 'Duplicate Cédula de Identidad (nationalId)',
    }),
  );

export const ApiUpdateStaffMember = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an existing staff member' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Staff Member ID', type: Number }),
    ApiOkResponse({
      description: 'Staff member updated successfully',
      type: StaffMemberResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Staff member not found' }),
    ApiConflictResponse({
      description: 'Duplicate Cédula de Identidad (nationalId)',
    }),
  );

export const ApiChangeStaffStatus = () =>
  applyDecorators(
    ApiOperation({ summary: 'Change the status of a staff member' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Staff Member ID', type: Number }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: Object.values(StaffStatus) },
        },
      },
    }),
    ApiOkResponse({
      description: 'Status updated successfully',
      type: StaffMemberResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Staff member not found' }),
  );

export const ApiDeleteStaffMember = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete (or terminate) a staff member' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Staff Member ID', type: Number }),
    ApiOkResponse({ description: 'Staff member removed successfully' }),
    ApiNotFoundResponse({ description: 'Staff member not found' }),
  );
