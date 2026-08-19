import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaxpayersTables1787164616959 implements MigrationInterface {
  name = 'CreateTaxpayersTables1787164616959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(
      `CREATE TABLE "taxpayer_directory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCode" character varying(2) NOT NULL DEFAULT 'PY', "ruc" character varying(25) NOT NULL, "businessName" character varying(255) NOT NULL, CONSTRAINT "UQ_e5ac03dc4e45330017071dd976b" UNIQUE ("countryCode", "ruc"), CONSTRAINT "PK_132415ab968265d4aa246b5101f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b710dc528f8bebde26740dc17" ON "taxpayer_directory" ("countryCode") `,
    );
    await queryRunner.query(
      `CREATE TABLE "taxpayer_cache" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCode" character varying(2) NOT NULL DEFAULT 'PY', "documentNumber" character varying(20) NOT NULL, "dv" character varying(2) NOT NULL, "ruc" character varying(25) NOT NULL, "businessName" character varying(255) NOT NULL, "firstName" character varying(150), "lastName" character varying(150), "taxpayerType" character varying(30) NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'ACTIVO', "address" character varying(255), "city" character varying(100), "cacheExpiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "rawData" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0f9e6ca73cfb040da4a0c2a9ce9" UNIQUE ("countryCode", "ruc"), CONSTRAINT "PK_6ec1e18c4322020e983b30e0197" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7a04862d6c25606869ef0f56f" ON "taxpayer_cache" ("countryCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a90c050406d46928d651ede644" ON "taxpayer_cache" ("documentNumber") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_91d39f28e9a4fd7c538e2fc436" ON "taxpayer_cache" ("cacheExpiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_taxpayer_cache_business_name_trgm" ON "taxpayer_cache" USING gin ("businessName" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_taxpayer_directory_name_trgm" ON "taxpayer_directory" USING gin ("businessName" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_taxpayer_directory_name_trgm"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_taxpayer_cache_business_name_trgm"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_91d39f28e9a4fd7c538e2fc436"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a90c050406d46928d651ede644"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7a04862d6c25606869ef0f56f"`,
    );
    await queryRunner.query(`DROP TABLE "taxpayer_cache"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b710dc528f8bebde26740dc17"`,
    );
    await queryRunner.query(`DROP TABLE "taxpayer_directory"`);
  }
}
