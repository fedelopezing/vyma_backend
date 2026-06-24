import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExchangeRatesTable1750000000003
  implements MigrationInterface
{
  name = 'CreateExchangeRatesTable1750000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "exchange_rates" ("id" BIGSERIAL NOT NULL, "currency" character varying(10) NOT NULL, "purchasePrice" integer NOT NULL, "salePrice" integer NOT NULL, "isFallback" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_33a614bad9e61956079d817ebe2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2badd7fe7d9fce6aa939a3f9d9" ON "exchange_rates" ("currency")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2badd7fe7d9fce6aa939a3f9d9"`,
    );
    await queryRunner.query(`DROP TABLE "exchange_rates"`);
  }
}
