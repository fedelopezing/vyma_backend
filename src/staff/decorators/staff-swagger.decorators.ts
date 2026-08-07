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
  ApiQuery,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import {
  StaffMemberResponseDto,
  PaginatedStaffResponseDto,
} from '../dto/staff-member-response.dto';
import { StaffStatus } from '../constants/staff-enums';

export const ApiGetStaffList = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener lista paginada de personal (Staff)' }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Número de página a consultar',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
      description: 'Resultados por página',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      example: 'Ana González',
      description:
        'Búsqueda por Nombre, Apellido, Nombre Completo o Cédula (CI) (insensible a acentos/tildes)',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: StaffStatus,
      description:
        'Filtrar por estado del personal (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)',
    }),
    ApiQuery({
      name: 'position',
      required: false,
      type: String,
      example: 'Personal de Limpieza',
      description: 'Filtrar por cargo o posición laboral',
    }),
    ApiOkResponse({
      description: 'Retorna la lista paginada de personal',
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
    ApiOperation({
      summary: 'Eliminar (eliminación lógica) un miembro de staff',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'ID del Miembro de Staff',
      type: Number,
    }),
    ApiNoContentResponse({
      description: 'Miembro de staff eliminado correctamente',
    }),
    ApiNotFoundResponse({ description: 'Miembro de staff no encontrado' }),
  );
