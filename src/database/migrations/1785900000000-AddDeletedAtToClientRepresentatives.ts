import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToClientRepresentatives1785900000000
  implements MigrationInterface
{
  name = 'AddDeletedAtToClientRepresentatives1785900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client_representatives" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client_representatives" DROP COLUMN "deletedAt"`,
    );
  }
}
