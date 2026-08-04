import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../roles/enums/role.enum';
import { ActiveCompanyId } from '../common/decorators/active-company-id.decorator';
import {
  CreateClientDto,
  UpdateClientDto,
  QueryClientDto,
  CreateClientRepresentativeDto,
  UpdateClientRepresentativeDto,
  CreateEstablishmentDto,
  UpdateEstablishmentDto,
  CreateContractDto,
  UpdateContractDto,
} from './dto';
import {
  ApiGetClientList,
  ApiGetClientById,
  ApiCreateClient,
  ApiUpdateClient,
  ApiDeleteClient,
  ApiGetRepresentatives,
  ApiCreateRepresentative,
  ApiUpdateRepresentative,
  ApiDeleteRepresentative,
  ApiGetEstablishments,
  ApiGetEstablishmentById,
  ApiCreateEstablishment,
  ApiUpdateEstablishment,
  ApiDeleteEstablishment,
  ApiGetContracts,
  ApiCreateContract,
  ApiUpdateContract,
  ApiDeleteContract,
  ApiGetEstablishmentStaff,
  ApiAssignStaffToEstablishment,
  ApiUnassignStaff,
} from './decorators/clients-swagger.decorators';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // --- Clients ---
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetClientList()
  async getClients(
    @ActiveCompanyId() companyId: number,
    @Query() query: QueryClientDto,
  ) {
    return this.clientsService.getClients(companyId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetClientById()
  async getClientById(
    @ActiveCompanyId() companyId: number,
    @Param('id') id: string,
  ) {
    return this.clientsService.getClientById(companyId, id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiCreateClient()
  async createClient(
    @ActiveCompanyId() companyId: number,
    @Body() createDto: CreateClientDto,
  ) {
    return this.clientsService.createClient(companyId, createDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiUpdateClient()
  async updateClient(
    @ActiveCompanyId() companyId: number,
    @Param('id') id: string,
    @Body() updateDto: UpdateClientDto,
  ) {
    return this.clientsService.updateClient(companyId, id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiDeleteClient()
  async deleteClient(
    @ActiveCompanyId() companyId: number,
    @Param('id') id: string,
  ) {
    return this.clientsService.deleteClient(companyId, id);
  }

  // --- Representatives ---
  @Get(':clientId/representatives')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetRepresentatives()
  async getRepresentatives(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
  ) {
    return this.clientsService.getRepresentatives(companyId, clientId);
  }

  @Post(':clientId/representatives')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiCreateRepresentative()
  async createRepresentative(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Body() createDto: CreateClientRepresentativeDto,
  ) {
    return this.clientsService.createRepresentative(companyId, clientId, createDto);
  }

  @Patch(':clientId/representatives/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiUpdateRepresentative()
  async updateRepresentative(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateClientRepresentativeDto,
  ) {
    return this.clientsService.updateRepresentative(companyId, clientId, id, updateDto);
  }

  @Delete(':clientId/representatives/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiDeleteRepresentative()
  async deleteRepresentative(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.deleteRepresentative(companyId, clientId, id);
  }

  // --- Establishments ---
  @Get(':clientId/establishments')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetEstablishments()
  async getEstablishments(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
  ) {
    return this.clientsService.getEstablishments(companyId, clientId);
  }

  @Get(':clientId/establishments/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetEstablishmentById()
  async getEstablishmentById(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.getEstablishmentById(companyId, clientId, id);
  }

  @Post(':clientId/establishments')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiCreateEstablishment()
  async createEstablishment(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Body() createDto: CreateEstablishmentDto,
  ) {
    return this.clientsService.createEstablishment(companyId, clientId, createDto);
  }

  @Patch(':clientId/establishments/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiUpdateEstablishment()
  async updateEstablishment(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateEstablishmentDto,
  ) {
    return this.clientsService.updateEstablishment(companyId, clientId, id, updateDto);
  }

  @Delete(':clientId/establishments/:id')
  @Roles(Role.ADMIN)
  @ApiDeleteEstablishment()
  async deleteEstablishment(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.deleteEstablishment(companyId, clientId, id);
  }

  // --- Contracts ---
  @Get(':clientId/establishments/:establishmentId/contracts')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetContracts()
  async getContracts(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.clientsService.getContracts(companyId, clientId, establishmentId);
  }

  @Post(':clientId/establishments/:establishmentId/contracts')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiCreateContract()
  async createContract(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
    @Body() createDto: CreateContractDto,
  ) {
    return this.clientsService.createContract(companyId, clientId, establishmentId, createDto);
  }

  @Get(':clientId/establishments/:establishmentId/contracts/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetContracts() // Reusing the same decorator or creating a specific one. The RFC didn't specify one for GetById but we have ApiGetContracts
  async getContractById(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.getContractById(companyId, clientId, establishmentId, id);
  }

  @Patch(':clientId/establishments/:establishmentId/contracts/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiUpdateContract()
  async updateContract(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateContractDto,
  ) {
    return this.clientsService.updateContract(companyId, clientId, establishmentId, id, updateDto);
  }

  @Delete(':clientId/establishments/:establishmentId/contracts/:id')
  @Roles(Role.ADMIN)
  @ApiDeleteContract()
  async deleteContract(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.deleteContract(companyId, clientId, establishmentId, id);
  }

  // --- Staff Assignments ---
  @Get(':clientId/establishments/:establishmentId/staff')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiGetEstablishmentStaff()
  async getEstablishmentStaff(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.clientsService.getEstablishmentStaff(companyId, clientId, establishmentId);
  }

  @Post(':clientId/establishments/:establishmentId/staff')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiAssignStaffToEstablishment()
  async assignStaffToEstablishment(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
    @Body() body: { staffMemberId: number; startDate: string },
  ) {
    return this.clientsService.assignStaffToEstablishment(companyId, clientId, establishmentId, body);
  }

  @Delete(':clientId/establishments/:establishmentId/staff/:staffId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiUnassignStaff()
  async unassignStaffFromEstablishment(
    @ActiveCompanyId() companyId: number,
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
    @Param('staffId') staffId: number,
  ) {
    return this.clientsService.unassignStaffFromEstablishment(companyId, clientId, establishmentId, staffId);
  }
}
