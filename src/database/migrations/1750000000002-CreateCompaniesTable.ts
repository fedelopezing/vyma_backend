import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompaniesTable1750000000002 implements MigrationInterface {
  name = 'CreateCompaniesTable1750000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" BIGSERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "taxId" character varying(50), "email" character varying(100), "phone" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_535ddf773996ede3697d07ef71" ON "companies" ("uuid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_535ddf773996ede3697d07ef71"`,
    );
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
