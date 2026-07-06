import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MemberResponseDto } from '../dto/member-response.dto';
import { PaginatedMembersResponseDto } from '../dto/paginated-members-response.dto';

export function ApiGetApprovedMembers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get paginated list of approved members for a company',
    }),
    ApiParam({
      name: 'companyUuid',
      description: 'UUID of the company (tenant)',
      example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    }),
    ApiResponse({
      status: 200,
      description: 'Returns paginated list of members',
      type: PaginatedMembersResponseDto,
    }),
  );
}

export function ApiGetFeaturedMembers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get list of featured members for a company' }),
    ApiParam({
      name: 'companyUuid',
      description: 'UUID of the company (tenant)',
      example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    }),
    ApiResponse({
      status: 200,
      description: 'Returns list of featured members',
      type: MemberResponseDto,
      isArray: true,
    }),
  );
}

export function ApiApplyMember() {
  return applyDecorators(
    ApiOperation({ summary: 'Apply for a new membership' }),
    ApiResponse({
      status: 201,
      description: 'Application submitted successfully',
      type: MemberResponseDto,
    }),
    ApiResponse({
      status: 400,
      description:
        'Validation failed (e.g. invalid reCAPTCHA or missing fields)',
    }),
  );
}

export function ApiGetAdminMembers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all members (pending, approved, etc.) for admin',
    }),
    ApiResponse({
      status: 200,
      description: 'Returns paginated list',
      type: PaginatedMembersResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden (Not admin or not belonging to tenant)',
    }),
  );
}

export function ApiUpdateMemberStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Approve, reject or deactivate a member' }),
    ApiParam({
      name: 'id',
      description: 'UUID of the member',
      example: 'uuid',
    }),
    ApiResponse({
      status: 200,
      description: 'Member status updated',
      type: MemberResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Member not found' }),
    ApiResponse({ status: 409, description: 'Optimistic locking conflict' }),
  );
}

export function ApiUpdateMemberFeatured() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark a member as featured or not' }),
    ApiParam({
      name: 'id',
      description: 'UUID of the member',
      example: 'uuid',
    }),
    ApiResponse({
      status: 200,
      description: 'Member featured status updated',
      type: MemberResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Member not found' }),
    ApiResponse({ status: 409, description: 'Optimistic locking conflict' }),
  );
}

export function ApiUpdateMember() {
  return applyDecorators(
    ApiOperation({ summary: 'Update general member information' }),
    ApiParam({
      name: 'id',
      description: 'UUID of the member',
      example: 'uuid',
    }),
    ApiResponse({
      status: 200,
      description: 'Member updated successfully',
      type: MemberResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Member not found' }),
    ApiResponse({ status: 409, description: 'Optimistic locking conflict' }),
  );
}
