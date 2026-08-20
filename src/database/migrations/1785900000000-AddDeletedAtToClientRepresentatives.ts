import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToClientRepresentatives1785900000000
  implements MigrationInterface
{
  name = 'AddDeletedAtToClientRepresentatives1785900000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // La columna ya existe en BD, dejamos vacío para no romper la transacción
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client_representatives" DROP COLUMN "deletedAt"`,
    );
  }
}
