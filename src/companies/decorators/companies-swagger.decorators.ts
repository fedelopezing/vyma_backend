import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { Company } from '../entities/company.entity';
import { UserCompany } from '../entities/user-company.entity';

export function ApiCreateCompany() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new company (SuperAdmin only)' }),
    ApiResponse({
      status: 201,
      description: 'Company created successfully.',
      type: Company,
    }),
    ApiResponse({ status: 403, description: 'Forbidden — SuperAdmin only.' }),
    ApiResponse({
      status: 409,
      description: 'Company with that taxId or name already exists.',
    }),
  );
}

export function ApiFindAllCompanies() {
  return applyDecorators(
    ApiOperation({ summary: 'List all companies (SuperAdmin only)' }),
    ApiResponse({ status: 200, description: 'Array of all companies.' }),
    ApiResponse({ status: 403, description: 'Forbidden — SuperAdmin only.' }),
  );
}

export function ApiUpdateCompany() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a company (SuperAdmin only)' }),
    ApiParam({ name: 'uuid', description: 'Company UUID' }),
    ApiResponse({
      status: 200,
      description: 'Company updated successfully.',
      type: Company,
    }),
    ApiResponse({ status: 403, description: 'Forbidden — SuperAdmin only.' }),
    ApiResponse({ status: 404, description: 'Company not found.' }),
  );
}

export function ApiFindCompanyByUuid() {
  return applyDecorators(
    ApiOperation({ summary: 'Get company by UUID (Admin or SuperAdmin)' }),
    ApiParam({ name: 'uuid', description: 'Company UUID' }),
    ApiResponse({
      status: 200,
      description: 'Company details.',
      type: Company,
    }),
    ApiResponse({ status: 404, description: 'Company not found.' }),
  );
}

export function ApiAddCompanyMember() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a member to a company (Admin of that company)',
    }),
    ApiParam({ name: 'uuid', description: 'Company UUID' }),
    ApiResponse({
      status: 201,
      description: 'Member added successfully.',
      type: UserCompany,
    }),
    ApiResponse({ status: 404, description: 'Company or user not found.' }),
    ApiResponse({
      status: 409,
      description: 'User is already a member of this company.',
    }),
  );
}

export function ApiRemoveCompanyMember() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a member from a company (Admin of that company)',
    }),
    ApiParam({ name: 'uuid', description: 'Company UUID' }),
    ApiParam({ name: 'userUuid', description: 'User UUID to remove' }),
    ApiResponse({ status: 200, description: 'Member removed successfully.' }),
    ApiResponse({ status: 404, description: 'Company or user not found.' }),
  );
}
