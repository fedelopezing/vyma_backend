import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Company } from '../../companies/entities/company.entity';

interface ICompaniesRepository {
  findByUuid(uuid: string): Promise<Company | null>;
}

/**
 * Resuelve una compañía a partir de su UUID y valida que exista y esté activa.
 *
 * @param companyUuid UUID de la compañía
 * @param companiesRepository Repositorio de compañías para realizar la búsqueda
 * @throws BadRequestException si no se provee el UUID
 * @throws NotFoundException si la compañía no existe o está inactiva
 */
export async function resolveActiveCompany(
  companyUuid: string,
  companiesRepository: ICompaniesRepository,
): Promise<Company> {
  if (!companyUuid) {
    throw new BadRequestException('companyUuid is required');
  }

  // Validar que sea un UUID v4 válido para evitar QueryFailedError en PostgreSQL
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(companyUuid)) {
    throw new BadRequestException('Invalid companyUuid format');
  }

  const company = await companiesRepository.findByUuid(companyUuid);
  if (!company || !company.isActive) {
    throw new NotFoundException('Company not found or inactive');
  }
  return company;
}
