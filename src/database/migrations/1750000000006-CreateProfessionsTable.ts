import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfessionsTable1750000000006 implements MigrationInterface {
  name = 'CreateProfessionsTable1750000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "professions" ("id" BIGSERIAL NOT NULL, "name" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "company_id" bigint NOT NULL, CONSTRAINT "UQ_b273de78f494fa9da6952ffa703" UNIQUE ("name"), CONSTRAINT "PK_9247c0d4b30fc6b796d59262058" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4713fa1afaa73ebeeef2d3a8ad" ON "professions" ("company_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_4713fa1afaa73ebeeef2d3a8ad0" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_4713fa1afaa73ebeeef2d3a8ad0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4713fa1afaa73ebeeef2d3a8ad"`,
    );
    await queryRunner.query(`DROP TABLE "professions"`);
  }
}
