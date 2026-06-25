import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { getErrorStack } from '../common/helpers/errors.helper';
import { SeedRepository } from './seed.repository';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly seedRepository: SeedRepository) {}

  async executeSeed(): Promise<{ message: string }> {
    const qr = this.seedRepository.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      this.logger.log('1. Cleaning database...');
      await this.seedRepository.truncateAllTables(qr);

      this.logger.log('2. Seeding permissions...');
      const permissionsMap = await this.seedRepository.createPermissions(qr);

      this.logger.log('3. Seeding roles...');
      const rolesMap = await this.seedRepository.createRoles(
        qr,
        permissionsMap,
      );

      this.logger.log('4. Seeding companies...');
      const companiesMap = await this.seedRepository.createCompanies(qr);

      this.logger.log('5. Seeding root user...');
      const rootUser = await this.seedRepository.createAdminUser(qr, rolesMap);

      this.logger.log('6. Seeding additional users and memberships...');
      await this.seedRepository.createAdditionalUsers(
        qr,
        rolesMap,
        companiesMap,
      );

      this.logger.log('7. Seeding news...');
      await this.seedRepository.createNews(qr, rootUser, companiesMap['CCPS']);

      this.logger.log('8. Seeding events...');
      await this.seedRepository.createEvents(
        qr,
        rootUser,
        companiesMap['CCPS'],
      );

      this.logger.log('9. Seeding members...');
      await this.seedRepository.createMembers(qr, companiesMap);

      await qr.commitTransaction();
      this.logger.log('Seed executed successfully!');
      return { message: 'Seed executed successfully' };
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error('Error executing seed', getErrorStack(error));
      throw new InternalServerErrorException('Error executing seed');
    } finally {
      await qr.release();
    }
  }
}
