import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyModulesAndExchangeRateCompanyRelation1783186025907
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columnas a "companies"
    await queryRunner.query(
      `ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "activeModules" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "domain" character varying`,
    );

    // Agregar constraint UNIQUE a "domain" si no existe
    const hasDomainConstraint = await queryRunner.query(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'UQ_companies_domain' AND table_name = 'companies'
        `);
    if (hasDomainConstraint.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "companies" ADD CONSTRAINT "UQ_companies_domain" UNIQUE ("domain")`,
      );
    }

    // 2. Agregar columnas y relación a "exchange_rates"
    await queryRunner.query(
      `ALTER TABLE "exchange_rates" ADD COLUMN IF NOT EXISTS "company_id" bigint`,
    );

    // Backfill de registros existentes para evitar errores de NOT NULL
    await queryRunner.query(
      `UPDATE "exchange_rates" SET "company_id" = 1 WHERE "company_id" IS NULL`,
    );

    // Poner NOT NULL si aún no lo está
    await queryRunner.query(
      `ALTER TABLE "exchange_rates" ALTER COLUMN "company_id" SET NOT NULL`,
    );

    // Crear índice si no existe
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_exchange_rates_company_id" ON "exchange_rates" ("company_id")`,
    );

    // Agregar constraint de FK si no existe
    const hasFk = await queryRunner.query(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_68f12ee5d49b0bc9afe417da5a6' AND table_name = 'exchange_rates'
        `);
    if (hasFk.length === 0) {
      await queryRunner.query(`
                ALTER TABLE "exchange_rates" 
                ADD CONSTRAINT "FK_68f12ee5d49b0bc9afe417da5a6" 
                FOREIGN KEY ("company_id") 
                REFERENCES "companies"("id") 
                ON DELETE CASCADE
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Revertir cambios en "exchange_rates"
    await queryRunner.query(
      `ALTER TABLE "exchange_rates" DROP CONSTRAINT IF EXISTS "FK_68f12ee5d49b0bc9afe417da5a6"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_exchange_rates_company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchange_rates" DROP COLUMN IF EXISTS "company_id"`,
    );

    // 2. Revertir cambios en "companies"
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "UQ_companies_domain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN IF EXISTS "domain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN IF EXISTS "activeModules"`,
    );
  }
}
