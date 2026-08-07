import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { isUUID } from 'class-validator';
import { IClientsRepository } from '../interfaces/i-clients-repository.interface';
import { Client } from '../entities/client.entity';
import { ClientRepresentative } from '../entities/client-representative.entity';
import { Establishment } from '../entities/establishment.entity';
import { Contract } from '../entities/contract.entity';
import { StaffEstablishmentAssignment } from '../entities/staff-establishment-assignment.entity';

import { QueryClientDto } from '../dto/client/query-client.dto';

@Injectable()
export class ClientsRepository implements IClientsRepository {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(ClientRepresentative)
    private readonly representativeRepo: Repository<ClientRepresentative>,
    @InjectRepository(Establishment)
    private readonly establishmentRepo: Repository<Establishment>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(StaffEstablishmentAssignment)
    private readonly assignmentRepo: Repository<StaffEstablishmentAssignment>,
  ) {}

  // --- Client ---
  async findByCompanyId(
    companyId: number,
    page: number = 1,
    limit: number = 20,
    filters?: QueryClientDto,
  ): Promise<[Client[], number]> {
    const query = this.clientRepo
      .createQueryBuilder('client')
      .where('client.companyId = :companyId', { companyId });

    if (filters?.clientType) {
      query.andWhere('client.clientType = :clientType', {
        clientType: filters.clientType,
      });
    }
    if (filters?.ruc) {
      query.andWhere('client.ruc ILIKE :ruc', { ruc: `%${filters.ruc}%` });
    }
    if (filters?.fantasyName) {
      query.andWhere('client.fantasyName ILIKE :fantasyName', {
        fantasyName: `%${filters.fantasyName}%`,
      });
    }
    if (filters?.search) {
      query.andWhere(
        '(client.businessName ILIKE :search OR client.fantasyName ILIKE :search OR client.ruc ILIKE :search OR client.emailPrimary ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.isActive !== undefined) {
      if (filters.isActive) {
        query.andWhere('client.deletedAt IS NULL');
      } else {
        query.withDeleted().andWhere('client.deletedAt IS NOT NULL');
      }
    }

    const orderByColumn = filters?.orderBy
      ? `client.${filters.orderBy}`
      : 'client.createdAt';
    const orderDirection = (filters?.order || 'DESC') as 'ASC' | 'DESC';
    query.orderBy(orderByColumn, orderDirection);

    return query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async findById(id: string, companyId: number): Promise<Client | null> {
    if (!isUUID(id)) return null;
    return this.clientRepo.findOne({ where: { id, companyId } });
  }

  async findByRuc(companyId: number, ruc: string): Promise<Client | null> {
    return this.clientRepo.findOne({ where: { companyId, ruc } });
  }

  async findClientWithRelations(
    id: string,
    companyId: number,
  ): Promise<Client | null> {
    if (!isUUID(id)) return null;
    return this.clientRepo.findOne({
      where: { id, companyId },
      relations: ['representatives', 'establishments'],
    });
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const client = this.clientRepo.create(clientData);
    return this.clientRepo.save(client);
  }

  async updateClient(
    id: string,
    companyId: number,
    updateData: Partial<Client>,
  ): Promise<Client | null> {
    if (!isUUID(id)) return null;
    await this.clientRepo.update({ id, companyId }, updateData);
    return this.findById(id, companyId);
  }

  async deleteClient(id: string, companyId: number): Promise<void> {
    if (!isUUID(id)) return;
    await this.clientRepo.softDelete({ id, companyId });
  }

  // --- Representatives ---
  async findRepresentativesByClientId(
    clientId: string,
  ): Promise<ClientRepresentative[]> {
    if (!isUUID(clientId)) return [];
    return this.representativeRepo.find({ where: { clientId } });
  }

  async createRepresentative(
    representativeData: Partial<ClientRepresentative>,
  ): Promise<ClientRepresentative> {
    const rep = this.representativeRepo.create(representativeData);
    return this.representativeRepo.save(rep);
  }

  async updateRepresentative(
    id: string,
    clientId: string,
    updateData: Partial<ClientRepresentative>,
  ): Promise<ClientRepresentative | null> {
    if (!isUUID(id) || !isUUID(clientId)) return null;
    await this.representativeRepo.update({ id, clientId }, updateData);
    return this.representativeRepo.findOne({
      where: { id, clientId },
    });
  }

  async deleteRepresentative(id: string, clientId: string): Promise<void> {
    if (!isUUID(id) || !isUUID(clientId)) return;
    await this.representativeRepo.softDelete({ id, clientId });
  }

  // --- Establishments ---
  async findEstablishmentsByClientId(
    clientId: string,
  ): Promise<Establishment[]> {
    if (!isUUID(clientId)) return [];
    return this.establishmentRepo.find({ where: { clientId } });
  }

  async findEstablishmentById(
    id: string,
    clientId: string,
  ): Promise<Establishment | null> {
    if (!isUUID(id) || !isUUID(clientId)) return null;
    return this.establishmentRepo.findOne({ where: { id, clientId } });
  }

  async findEstablishmentWithStaff(
    id: string,
    clientId: string,
  ): Promise<Establishment | null> {
    if (!isUUID(id) || !isUUID(clientId)) return null;
    return this.establishmentRepo.findOne({
      where: { id, clientId },
      relations: [
        'contracts',
        'staffAssignments',
        'staffAssignments.staffMember',
      ],
    });
  }

  async createEstablishment(
    establishmentData: Partial<Establishment>,
  ): Promise<Establishment> {
    const est = this.establishmentRepo.create(establishmentData);
    return this.establishmentRepo.save(est);
  }

  async updateEstablishment(
    id: string,
    clientId: string,
    updateData: Partial<Establishment>,
  ): Promise<Establishment | null> {
    if (!isUUID(id) || !isUUID(clientId)) return null;
    await this.establishmentRepo.update({ id, clientId }, updateData);
    return this.findEstablishmentById(id, clientId);
  }

  async deleteEstablishment(id: string, clientId: string): Promise<void> {
    if (!isUUID(id) || !isUUID(clientId)) return;
    await this.establishmentRepo.softDelete({ id, clientId });
  }

  // --- Contracts ---
  async findContractsByEstablishmentId(
    establishmentId: string,
  ): Promise<Contract[]> {
    if (!isUUID(establishmentId)) return [];
    return this.contractRepo.find({ where: { establishmentId } });
  }

  async findContractById(
    id: string,
    establishmentId: string,
  ): Promise<Contract | null> {
    if (!isUUID(id) || !isUUID(establishmentId)) return null;
    return this.contractRepo.findOne({ where: { id, establishmentId } });
  }

  async createContract(contractData: Partial<Contract>): Promise<Contract> {
    const contract = this.contractRepo.create(contractData);
    return this.contractRepo.save(contract);
  }

  async updateContract(
    id: string,
    establishmentId: string,
    updateData: Partial<Contract>,
  ): Promise<Contract | null> {
    if (!isUUID(id) || !isUUID(establishmentId)) return null;
    await this.contractRepo.update({ id, establishmentId }, updateData);
    return this.findContractById(id, establishmentId);
  }

  async deleteContract(id: string, establishmentId: string): Promise<void> {
    if (!isUUID(id) || !isUUID(establishmentId)) return;
    await this.contractRepo.softDelete({ id, establishmentId });
  }

  // --- Staff Assignments ---
  async findStaffByEstablishmentId(
    establishmentId: string,
  ): Promise<StaffEstablishmentAssignment[]> {
    if (!isUUID(establishmentId)) return [];
    return this.assignmentRepo.find({
      where: { establishmentId },
      relations: ['staffMember'],
    });
  }

  async findActiveAssignments(
    establishmentId: string,
  ): Promise<StaffEstablishmentAssignment[]> {
    if (!isUUID(establishmentId)) return [];
    return this.assignmentRepo.find({
      where: { establishmentId, endDate: IsNull() },
      relations: ['staffMember'],
    });
  }

  async assignStaffToEstablishment(
    assignmentData: Partial<StaffEstablishmentAssignment>,
  ): Promise<StaffEstablishmentAssignment> {
    const assignment = this.assignmentRepo.create(assignmentData);
    return this.assignmentRepo.save(assignment);
  }

  async unassignStaffFromEstablishment(
    staffMemberId: number,
    establishmentId: string,
  ): Promise<void> {
    if (!isUUID(establishmentId)) return;
    await this.assignmentRepo.update(
      { staffMemberId, establishmentId, endDate: IsNull() },
      { endDate: new Date() },
    );
  }
}
