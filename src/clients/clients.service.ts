import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { buildPaginatedResponse } from '../common/helpers';
import { Client } from './entities/client.entity';
import { ClientRepresentative } from './entities/client-representative.entity';
import { Contract } from './entities/contract.entity';
import {
  IClientsRepository,
  CLIENTS_REPOSITORY,
} from './interfaces/i-clients-repository.interface';
import { ClientType } from './constants/clients-enums';
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
  AssignStaffDto,
} from './dto';
import {
  ClientNotFoundException,
  ClientDuplicateRucException,
  EstablishmentNotFoundException,
  ContractNotFoundException,
  RepresentativeNotFoundException,
} from './exceptions/index';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENTS_REPOSITORY)
    private readonly clientsRepository: IClientsRepository,
    private readonly staffService: StaffService,
  ) {}

  // --- Client ---
  async getClients(companyId: number, query: QueryClientDto) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const [data, total] = await this.clientsRepository.findByCompanyId(
        companyId,
        page,
        limit,
        query,
      );

      return buildPaginatedResponse(data, total, page, limit);
    } catch (error) {
      throw error;
    }
  }

  async getClientById(companyId: number, id: string) {
    try {
      const client = await this.clientsRepository.findClientWithRelations(
        id,
        companyId,
      );
      if (!client) {
        throw new ClientNotFoundException(id);
      }
      return client;
    } catch (error) {
      throw error;
    }
  }

  async createClient(companyId: number, createDto: CreateClientDto) {
    try {
      // 1. Validar RUC único por tenant
      const existingClient = await this.clientsRepository.findByRuc(
        companyId,
        createDto.ruc,
      );
      if (existingClient) {
        throw new ClientDuplicateRucException(createDto.ruc);
      }

      // 2. Validaciones adicionales de lógica de negocio (más allá del DTO)
      if (createDto.clientType === ClientType.PERSONA_FISICA) {
        if (!createDto.firstName || !createDto.lastName) {
          throw new BadRequestException(
            'firstName and lastName are required for PERSONA_FISICA',
          );
        }
      }

      const clientData: Partial<Client> = {
        ...createDto,
        companyId,
        birthDate: createDto.birthDate
          ? new Date(createDto.birthDate)
          : undefined,
      };

      const client = await this.clientsRepository.createClient(clientData);

      return client;
    } catch (error) {
      throw error;
    }
  }

  async updateClient(
    companyId: number,
    id: string,
    updateDto: UpdateClientDto,
  ) {
    try {
      const client = await this.clientsRepository.findById(id, companyId);
      if (!client) {
        throw new ClientNotFoundException(id);
      }

      if (updateDto.ruc && updateDto.ruc !== client.ruc) {
        const existingRuc = await this.clientsRepository.findByRuc(
          companyId,
          updateDto.ruc,
        );
        if (existingRuc) {
          throw new ClientDuplicateRucException(updateDto.ruc);
        }
      }

      const updateData: Partial<Client> = {
        ...updateDto,
        birthDate: updateDto.birthDate
          ? new Date(updateDto.birthDate)
          : undefined,
      };

      return await this.clientsRepository.updateClient(
        id,
        companyId,
        updateData,
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteClient(companyId: number, id: string) {
    try {
      const client = await this.clientsRepository.findById(id, companyId);
      if (!client) {
        throw new ClientNotFoundException(id);
      }
      await this.clientsRepository.deleteClient(id, companyId);
    } catch (error) {
      throw error;
    }
  }

  // --- Representatives ---
  async getRepresentatives(companyId: number, clientId: string) {
    try {
      await this.getClientById(companyId, clientId); // Validates client exists and belongs to company
      return await this.clientsRepository.findRepresentativesByClientId(
        clientId,
      );
    } catch (error) {
      throw error;
    }
  }

  async createRepresentative(
    companyId: number,
    clientId: string,
    createDto: CreateClientRepresentativeDto,
  ) {
    try {
      await this.getClientById(companyId, clientId);
      const repData: Partial<ClientRepresentative> = {
        ...createDto,
        clientId,
        roleStartDate: createDto.roleStartDate
          ? new Date(createDto.roleStartDate)
          : undefined,
        roleEndDate: createDto.roleEndDate
          ? new Date(createDto.roleEndDate)
          : undefined,
      };

      return await this.clientsRepository.createRepresentative(repData);
    } catch (error) {
      throw error;
    }
  }

  async updateRepresentative(
    companyId: number,
    clientId: string,
    id: string,
    updateDto: UpdateClientRepresentativeDto,
  ) {
    try {
      await this.getClientById(companyId, clientId);
      const updateData: Partial<ClientRepresentative> = {
        ...updateDto,
        roleStartDate: updateDto.roleStartDate
          ? new Date(updateDto.roleStartDate)
          : undefined,
        roleEndDate: updateDto.roleEndDate
          ? new Date(updateDto.roleEndDate)
          : undefined,
      };

      const updated = await this.clientsRepository.updateRepresentative(
        id,
        clientId,
        updateData,
      );
      if (!updated) {
        throw new RepresentativeNotFoundException(id);
      }
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteRepresentative(companyId: number, clientId: string, id: string) {
    try {
      await this.getClientById(companyId, clientId);
      await this.clientsRepository.deleteRepresentative(id, clientId);
    } catch (error) {
      throw error;
    }
  }

  // --- Establishments ---
  async getEstablishments(companyId: number, clientId: string) {
    try {
      await this.getClientById(companyId, clientId);
      return await this.clientsRepository.findEstablishmentsByClientId(
        clientId,
      );
    } catch (error) {
      throw error;
    }
  }

  async getEstablishmentById(companyId: number, clientId: string, id: string) {
    try {
      await this.getClientById(companyId, clientId);
      const est = await this.clientsRepository.findEstablishmentWithStaff(
        id,
        clientId,
      );
      if (!est) {
        throw new EstablishmentNotFoundException(id);
      }
      return est;
    } catch (error) {
      throw error;
    }
  }

  async createEstablishment(
    companyId: number,
    clientId: string,
    createDto: CreateEstablishmentDto,
  ) {
    try {
      await this.getClientById(companyId, clientId);
      return await this.clientsRepository.createEstablishment({
        ...createDto,
        clientId,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateEstablishment(
    companyId: number,
    clientId: string,
    id: string,
    updateDto: UpdateEstablishmentDto,
  ) {
    try {
      await this.getClientById(companyId, clientId);
      const updated = await this.clientsRepository.updateEstablishment(
        id,
        clientId,
        updateDto,
      );
      if (!updated) {
        throw new EstablishmentNotFoundException(id);
      }
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteEstablishment(companyId: number, clientId: string, id: string) {
    try {
      await this.getClientById(companyId, clientId);
      const est = await this.clientsRepository.findEstablishmentById(
        id,
        clientId,
      );
      if (!est) {
        throw new EstablishmentNotFoundException(id);
      }
      await this.clientsRepository.deleteEstablishment(id, clientId);
    } catch (error) {
      throw error;
    }
  }

  // --- Contracts ---
  async getContracts(
    companyId: number,
    clientId: string,
    establishmentId: string,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);
      return await this.clientsRepository.findContractsByEstablishmentId(
        establishmentId,
      );
    } catch (error) {
      throw error;
    }
  }

  async getContractById(
    companyId: number,
    clientId: string,
    establishmentId: string,
    id: string,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);
      const contract = await this.clientsRepository.findContractById(
        id,
        establishmentId,
      );
      if (!contract) {
        throw new ContractNotFoundException(id);
      }
      return contract;
    } catch (error) {
      throw error;
    }
  }

  async createContract(
    companyId: number,
    clientId: string,
    establishmentId: string,
    createDto: CreateContractDto,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);

      // RFC Rule: monthlyAmount is required for any contract in Phase 1
      if (
        createDto.monthlyAmount === undefined ||
        createDto.monthlyAmount === null
      ) {
        throw new BadRequestException('monthlyAmount is required');
      }

      // Convert start/end dates from string to Date
      const startDate = new Date(createDto.startDate);
      const endDate = createDto.endDate ? new Date(createDto.endDate) : null;

      return await this.clientsRepository.createContract({
        ...createDto,
        startDate,
        endDate: endDate || undefined,
        establishmentId,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateContract(
    companyId: number,
    clientId: string,
    establishmentId: string,
    id: string,
    updateDto: UpdateContractDto,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);

      const updateData: Partial<Contract> = {
        ...updateDto,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
      };

      const updated = await this.clientsRepository.updateContract(
        id,
        establishmentId,
        updateData,
      );
      if (!updated) {
        throw new ContractNotFoundException(id);
      }
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteContract(
    companyId: number,
    clientId: string,
    establishmentId: string,
    id: string,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);
      const contract = await this.clientsRepository.findContractById(
        id,
        establishmentId,
      );
      if (!contract) {
        throw new ContractNotFoundException(id);
      }
      await this.clientsRepository.deleteContract(id, establishmentId);
    } catch (error) {
      throw error;
    }
  }

  // --- Staff Assignments ---
  async getEstablishmentStaff(
    companyId: number,
    clientId: string,
    establishmentId: string,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);
      return await this.clientsRepository.findStaffByEstablishmentId(
        establishmentId,
      );
    } catch (error) {
      throw error;
    }
  }

  async assignStaffToEstablishment(
    companyId: number,
    clientId: string,
    establishmentId: string,
    dto: AssignStaffDto,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);

      const staffMemberId = Number(dto.staffMemberId);
      if (isNaN(staffMemberId)) {
        throw new BadRequestException('staffMemberId must be a valid number');
      }

      await this.staffService.findById(staffMemberId, companyId);

      const assignment =
        await this.clientsRepository.assignStaffToEstablishment({
          staffMemberId,
          establishmentId,
          startDate: new Date(dto.startDate),
        });

      return {
        ...assignment,
        staffMemberId,
        isActive:
          assignment.endDate === null || assignment.endDate === undefined,
      };
    } catch (error) {
      if (error?.code === '23503') {
        throw new NotFoundException(
          `StaffMember with id ${dto.staffMemberId} not found`,
        );
      }
      throw error;
    }
  }

  async unassignStaffFromEstablishment(
    companyId: number,
    clientId: string,
    establishmentId: string,
    staffMemberId: number,
  ) {
    try {
      await this.getEstablishmentById(companyId, clientId, establishmentId);
      const parsedStaffId = Number(staffMemberId);
      if (isNaN(parsedStaffId)) {
        throw new BadRequestException('staffMemberId must be a valid number');
      }
      await this.clientsRepository.unassignStaffFromEstablishment(
        parsedStaffId,
        establishmentId,
      );
    } catch (error) {
      throw error;
    }
  }
}
