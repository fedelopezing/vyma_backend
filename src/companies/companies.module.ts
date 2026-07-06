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
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, UserCompany]),
    UsersModule,
    RolesModule,
    CommonModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository, UserCompanyRepository],
  exports: [CompaniesService, UserCompanyRepository, CompaniesRepository],
})
export class CompaniesModule {}
