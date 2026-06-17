import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiTenantCompanies1781545329781
  implements MigrationInterface
{
  name = 'AddMultiTenantCompanies1781545329781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_companies" ("userId" bigint NOT NULL, "companyId" bigint NOT NULL, "roleId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b5b4fd1b21f221e3f91a438d93" PRIMARY KEY ("userId", "companyId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_295e2ec0606b47e50687ff46c3" ON "user_companies" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbcec9c4908de8338081b5bfeb" ON "user_companies" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0b5b4fd1b21f221e3f91a438d9" ON "user_companies" ("userId", "companyId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" BIGSERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "taxId" character varying(50), "email" character varying(100), "phone" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_535ddf773996ede3697d07ef71" ON "companies" ("uuid") `,
    );
    await queryRunner.query(
      `INSERT INTO "companies" ("name") VALUES ('Default Company')`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "company_id" bigint NULL`,
    );
    await queryRunner.query(`UPDATE "professions" SET "company_id" = 1`);
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "company_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" ADD "company_id" bigint NULL`,
    );
    await queryRunner.query(`UPDATE "schedule_breaks" SET "company_id" = 1`);
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" ALTER COLUMN "company_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "schedules" ADD "company_id" bigint NULL`,
    );
    await queryRunner.query(`UPDATE "schedules" SET "company_id" = 1`);
    await queryRunner.query(
      `ALTER TABLE "schedules" ALTER COLUMN "company_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isSuperAdmin" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "users"."isSuperAdmin" IS 'Indicates if the user has super admin privileges across all tenants'`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "company_id" bigint NULL`,
    );
    await queryRunner.query(`UPDATE "services" SET "company_id" = 1`);
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "company_id" SET NOT NULL`,
    );

    await queryRunner.query(`ALTER TABLE "news" ADD "company_id" bigint NULL`);
    await queryRunner.query(`UPDATE "news" SET "company_id" = 1`);
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "company_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4713fa1afaa73ebeeef2d3a8ad" ON "professions" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5de0609b9e1760faed608577ae" ON "schedule_breaks" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4312587691718bbddaf92b4c86" ON "schedules" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e753d53a2de803b47ed9acec4" ON "services" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7cdd3524a000b1cde5683fc80b" ON "news" ("company_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" ADD CONSTRAINT "FK_295e2ec0606b47e50687ff46c34" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" ADD CONSTRAINT "FK_fbcec9c4908de8338081b5bfeb0" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" ADD CONSTRAINT "FK_533c70e5f26cbf874cdf2fbfff3" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_4713fa1afaa73ebeeef2d3a8ad0" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" ADD CONSTRAINT "FK_5de0609b9e1760faed608577aec" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_4312587691718bbddaf92b4c866" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_8e753d53a2de803b47ed9acec4c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "FK_7cdd3524a000b1cde5683fc80bf" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT "FK_7cdd3524a000b1cde5683fc80bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_8e753d53a2de803b47ed9acec4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_4312587691718bbddaf92b4c866"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" DROP CONSTRAINT "FK_5de0609b9e1760faed608577aec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_4713fa1afaa73ebeeef2d3a8ad0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" DROP CONSTRAINT "FK_533c70e5f26cbf874cdf2fbfff3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" DROP CONSTRAINT "FK_fbcec9c4908de8338081b5bfeb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" DROP CONSTRAINT "FK_295e2ec0606b47e50687ff46c34"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7cdd3524a000b1cde5683fc80b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e753d53a2de803b47ed9acec4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4312587691718bbddaf92b4c86"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5de0609b9e1760faed608577ae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4713fa1afaa73ebeeef2d3a8ad"`,
    );
    await queryRunner.query(`ALTER TABLE "news" DROP COLUMN "company_id"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "company_id"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "users"."isSuperAdmin" IS 'Indicates if the user has super admin privileges across all tenants'`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isSuperAdmin"`);
    await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "company_id"`);
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_535ddf773996ede3697d07ef71"`,
    );
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0b5b4fd1b21f221e3f91a438d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbcec9c4908de8338081b5bfeb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_295e2ec0606b47e50687ff46c3"`,
    );
    await queryRunner.query(`DROP TABLE "user_companies"`);
  }
}
