import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClientResponseDto } from '../dto/client/client-response.dto';
import { ClientRepresentativeResponseDto } from '../dto/representative/client-representative-response.dto';
import { EstablishmentResponseDto } from '../dto/establishment/establishment-response.dto';
import { ContractResponseDto } from '../dto/contract/contract-response.dto';

// --- Client ---
export function ApiGetClientList() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener lista de clientes paginada' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'ruc', required: false, type: String }),
    ApiQuery({ name: 'fantasyName', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Lista de clientes obtenida correctamente.' })
  );
}

export function ApiGetClientById() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener cliente por ID' }),
    ApiParam({ name: 'id', description: 'ID del cliente' }),
    ApiResponse({ status: 200, description: 'Cliente obtenido correctamente.', type: ClientResponseDto }),
    ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  );
}

export function ApiCreateClient() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear nuevo cliente' }),
    ApiResponse({ status: 201, description: 'Cliente creado correctamente.', type: ClientResponseDto }),
    ApiResponse({ status: 400, description: 'Datos inválidos.' }),
    ApiResponse({ status: 409, description: 'RUC duplicado.' })
  );
}

export function ApiUpdateClient() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar ficha fiscal del cliente' }),
    ApiParam({ name: 'id', description: 'ID del cliente' }),
    ApiResponse({ status: 200, description: 'Cliente actualizado correctamente.', type: ClientResponseDto }),
    ApiResponse({ status: 404, description: 'Cliente no encontrado.' }),
    ApiResponse({ status: 409, description: 'RUC duplicado.' })
  );
}

export function ApiDeleteClient() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar cliente (soft delete)' }),
    ApiParam({ name: 'id', description: 'ID del cliente' }),
    ApiResponse({ status: 204, description: 'Cliente eliminado correctamente.' }),
    ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  );
}

// --- Representatives ---
export function ApiGetRepresentatives() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener representantes del cliente' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiResponse({ status: 200, description: 'Representantes obtenidos correctamente.', type: [ClientRepresentativeResponseDto] })
  );
}

export function ApiCreateRepresentative() {
  return applyDecorators(
    ApiOperation({ summary: 'Agregar representante al cliente' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiResponse({ status: 201, description: 'Representante creado correctamente.', type: ClientRepresentativeResponseDto })
  );
}

export function ApiUpdateRepresentative() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar representante' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'id', description: 'ID del representante' }),
    ApiResponse({ status: 200, description: 'Representante actualizado correctamente.', type: ClientRepresentativeResponseDto }),
    ApiResponse({ status: 404, description: 'Representante no encontrado.' })
  );
}

export function ApiDeleteRepresentative() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar representante' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'id', description: 'ID del representante' }),
    ApiResponse({ status: 204, description: 'Representante eliminado correctamente.' })
  );
}

// --- Establishments ---
export function ApiGetEstablishments() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener lista de sedes del cliente' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiResponse({ status: 200, description: 'Sedes obtenidas correctamente.', type: [EstablishmentResponseDto] })
  );
}

export function ApiGetEstablishmentById() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener sede por ID' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'id', description: 'ID de la sede' }),
    ApiResponse({ status: 200, description: 'Sede obtenida correctamente.', type: EstablishmentResponseDto }),
    ApiResponse({ status: 404, description: 'Sede no encontrada.' })
  );
}

export function ApiCreateEstablishment() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear nueva sede operativa' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiResponse({ status: 201, description: 'Sede creada correctamente.', type: EstablishmentResponseDto })
  );
}

export function ApiUpdateEstablishment() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar sede operativa' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'id', description: 'ID de la sede' }),
    ApiResponse({ status: 200, description: 'Sede actualizada correctamente.', type: EstablishmentResponseDto }),
    ApiResponse({ status: 404, description: 'Sede no encontrada.' })
  );
}

export function ApiDeleteEstablishment() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar sede (soft delete)' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'id', description: 'ID de la sede' }),
    ApiResponse({ status: 204, description: 'Sede eliminada correctamente.' })
  );
}

// --- Contracts ---
export function ApiGetContracts() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener lista de contratos de la sede' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiResponse({ status: 200, description: 'Contratos obtenidos correctamente.', type: [ContractResponseDto] })
  );
}

export function ApiCreateContract() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear contrato para la sede' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiResponse({ status: 201, description: 'Contrato creado correctamente.', type: ContractResponseDto })
  );
}

export function ApiUpdateContract() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar contrato' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiParam({ name: 'id', description: 'ID del contrato' }),
    ApiResponse({ status: 200, description: 'Contrato actualizado correctamente.', type: ContractResponseDto }),
    ApiResponse({ status: 404, description: 'Contrato no encontrado.' })
  );
}

export function ApiDeleteContract() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar contrato (soft delete)' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiParam({ name: 'id', description: 'ID del contrato' }),
    ApiResponse({ status: 204, description: 'Contrato eliminado correctamente.' })
  );
}

// --- Staff Assignments ---
export function ApiGetEstablishmentStaff() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener personal asignado a la sede' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiResponse({ status: 200, description: 'Personal obtenido correctamente.' })
  );
}

export function ApiAssignStaffToEstablishment() {
  return applyDecorators(
    ApiOperation({ summary: 'Asignar personal a la sede' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiResponse({ status: 201, description: 'Personal asignado correctamente.' })
  );
}

export function ApiUnassignStaff() {
  return applyDecorators(
    ApiOperation({ summary: 'Desasignar personal de la sede' }),
    ApiParam({ name: 'clientId', description: 'ID del cliente' }),
    ApiParam({ name: 'establishmentId', description: 'ID de la sede' }),
    ApiParam({ name: 'staffId', description: 'ID del personal' }),
    ApiResponse({ status: 204, description: 'Personal desasignado correctamente.' })
  );
}
