import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTable1750000000007 implements MigrationInterface {
  name = 'CreateServicesTable1750000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" BIGSERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" text, "duration_minutes" integer NOT NULL, "price" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "company_id" bigint NOT NULL, CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e753d53a2de803b47ed9acec4" ON "services" ("company_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_8e753d53a2de803b47ed9acec4c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_8e753d53a2de803b47ed9acec4c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e753d53a2de803b47ed9acec4"`,
    );
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
