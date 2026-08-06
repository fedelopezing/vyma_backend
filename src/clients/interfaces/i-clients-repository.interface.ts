import { Client } from '../entities/client.entity';
import { ClientRepresentative } from '../entities/client-representative.entity';
import { Establishment } from '../entities/establishment.entity';
import { Contract } from '../entities/contract.entity';
import { StaffEstablishmentAssignment } from '../entities/staff-establishment-assignment.entity';
import { QueryClientDto } from '../dto/client/query-client.dto';

export const CLIENTS_REPOSITORY = 'CLIENTS_REPOSITORY';

export interface IClientsRepository {
  // --- Client ---
  findByCompanyId(
    companyId: number,
    page: number,
    limit: number,
    filters?: QueryClientDto,
  ): Promise<[Client[], number]>;
  findById(id: string, companyId: number): Promise<Client | null>;
  findByRuc(companyId: number, ruc: string): Promise<Client | null>;
  findClientWithRelations(
    id: string,
    companyId: number,
  ): Promise<Client | null>;
  createClient(clientData: Partial<Client>): Promise<Client>;
  updateClient(
    id: string,
    companyId: number,
    updateData: Partial<Client>,
  ): Promise<Client | null>;
  deleteClient(id: string, companyId: number): Promise<void>;

  // --- Representatives ---
  findRepresentativesByClientId(
    clientId: string,
  ): Promise<ClientRepresentative[]>;
  createRepresentative(
    representativeData: Partial<ClientRepresentative>,
  ): Promise<ClientRepresentative>;
  updateRepresentative(
    id: string,
    clientId: string,
    updateData: Partial<ClientRepresentative>,
  ): Promise<ClientRepresentative | null>;
  deleteRepresentative(id: string, clientId: string): Promise<void>;

  // --- Establishments ---
  findEstablishmentsByClientId(clientId: string): Promise<Establishment[]>;
  findEstablishmentById(
    id: string,
    clientId: string,
  ): Promise<Establishment | null>;
  findEstablishmentWithStaff(
    id: string,
    clientId: string,
  ): Promise<Establishment | null>;
  createEstablishment(
    establishmentData: Partial<Establishment>,
  ): Promise<Establishment>;
  updateEstablishment(
    id: string,
    clientId: string,
    updateData: Partial<Establishment>,
  ): Promise<Establishment | null>;
  deleteEstablishment(id: string, clientId: string): Promise<void>;

  // --- Contracts ---
  findContractsByEstablishmentId(establishmentId: string): Promise<Contract[]>;
  findContractById(
    id: string,
    establishmentId: string,
  ): Promise<Contract | null>;
  createContract(contractData: Partial<Contract>): Promise<Contract>;
  updateContract(
    id: string,
    establishmentId: string,
    updateData: Partial<Contract>,
  ): Promise<Contract | null>;
  deleteContract(id: string, establishmentId: string): Promise<void>;

  // --- Staff Assignments ---
  findStaffByEstablishmentId(
    establishmentId: string,
  ): Promise<StaffEstablishmentAssignment[]>;
  findActiveAssignments(
    establishmentId: string,
  ): Promise<StaffEstablishmentAssignment[]>;
  assignStaffToEstablishment(
    assignmentData: Partial<StaffEstablishmentAssignment>,
  ): Promise<StaffEstablishmentAssignment>;
  unassignStaffFromEstablishment(
    staffMemberId: number,
    establishmentId: string,
  ): Promise<void>;
}
