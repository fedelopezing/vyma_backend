import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyModule } from '../common/constants/modules.enum';
import { CompaniesRepository } from './repositories/companies.repository';
import { UserCompanyRepository } from './repositories/user-company.repository';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { Company } from './entities/company.entity';
import { UserCompany } from './entities/user-company.entity';
import { CreateCompanyDto, UpdateCompanyDto, AddMemberDto } from './dto';
import { CompanyNotFoundException } from './exceptions/company-not-found.exception';
import { MemberAlreadyExistsException } from './exceptions/member-already-exists.exception';
import { CompanyAlreadyExistsException } from './exceptions/company-already-exists.exception';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly userCompanyRepository: UserCompanyRepository,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    try {
      return await this.companiesRepository.create(dto);
    } catch (error) {
      if (error.code === '23505') {
        throw new CompanyAlreadyExistsException();
      }
      throw error;
    }
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.findAll();
  }

  async findByUuid(uuid: string): Promise<Company> {
    const company = await this.companiesRepository.findByUuid(uuid);
    if (!company) {
      throw new CompanyNotFoundException();
    }
    return company;
  }

  async update(uuid: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findByUuid(uuid);
    return this.companiesRepository.update(company.id, dto);
  }

  async activateModule(uuid: string, module: CompanyModule): Promise<Company> {
    const company = await this.findByUuid(uuid);

    if (company.activeModules.includes(module)) {
      return company;
    }

    const activeModules = [...company.activeModules, module];
    return this.companiesRepository.update(company.id, { activeModules });
  }

  async deactivateModule(
    uuid: string,
    module: CompanyModule,
  ): Promise<Company> {
    const company = await this.findByUuid(uuid);

    if (!company.activeModules.includes(module)) {
      return company;
    }

    const activeModules = company.activeModules.filter((m) => m !== module);
    return this.companiesRepository.update(company.id, { activeModules });
  }

  async addMember(
    companyUuid: string,
    dto: AddMemberDto,
  ): Promise<UserCompany> {
    const company = await this.findByUuid(companyUuid);

    const user = await this.usersService.findOneByUuid(dto.userUuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // rolesService.findOne throws RoleNotFoundException if the role does not exist
    const role = await this.rolesService.findOne(dto.roleId);

    try {
      return await this.userCompanyRepository.addMember(
        user.id,
        company.id,
        role.id,
      );
    } catch (error) {
      if (error.code === '23505') {
        throw new MemberAlreadyExistsException();
      }
      throw error;
    }
  }

  async removeMember(companyUuid: string, userUuid: string): Promise<void> {
    const company = await this.findByUuid(companyUuid);

    const user = await this.usersService.findOneByUuid(userUuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userCompanyRepository.removeMember(user.id, company.id);
  }
}
