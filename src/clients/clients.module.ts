import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './repositories/clients.repository';
import { CLIENTS_REPOSITORY } from './interfaces/i-clients-repository.interface';
import { Client } from './entities/client.entity';
import { ClientRepresentative } from './entities/client-representative.entity';
import { Establishment } from './entities/establishment.entity';
import { Contract } from './entities/contract.entity';
import { StaffEstablishmentAssignment } from './entities/staff-establishment-assignment.entity';
import { StaffModule } from '../staff/staff.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClientRepresentative,
      Establishment,
      Contract,
      StaffEstablishmentAssignment,
    ]),
    StaffModule,
    CompaniesModule,
  ],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    {
      provide: CLIENTS_REPOSITORY,
      useClass: ClientsRepository,
    },
  ],
  exports: [ClientsService, CLIENTS_REPOSITORY],
})
export class ClientsModule {}
