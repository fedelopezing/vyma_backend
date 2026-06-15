import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { UserCompany } from './entities/user-company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './repositories/companies.repository';
import { UserCompanyRepository } from './repositories/user-company.repository';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, UserCompany]),
    UsersModule,
    RolesModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository, UserCompanyRepository],
  exports: [CompaniesService, UserCompanyRepository],
})
export class CompaniesModule {}
