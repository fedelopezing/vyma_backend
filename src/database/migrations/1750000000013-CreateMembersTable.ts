import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMembersTable1750000000013 implements MigrationInterface {
  name = 'CreateMembersTable1750000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."members_fee_type_enum" AS ENUM('ANNUAL', 'SEMIANNUAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."members_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" bigint NOT NULL, "email" character varying(255) NOT NULL, "fee_type" "public"."members_fee_type_enum" NOT NULL, "company_name" character varying(255) NOT NULL, "tax_id" character varying(50) NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(100) NOT NULL, "country" character varying(100) NOT NULL, "phone" character varying(50) NOT NULL, "category" character varying(100) NOT NULL, "representative_name" character varying(255) NOT NULL, "representative_email" character varying(255) NOT NULL, "representative_phone" character varying(50) NOT NULL, "social_links" jsonb, "marketing_contact" jsonb, "logo_url" text, "is_featured" boolean NOT NULL DEFAULT false, "status" "public"."members_status_enum" NOT NULL DEFAULT 'PENDING', "version" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_2714af51e3f7dd42cf66eeb08d6" UNIQUE ("email"), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e0aa1c0f8c54664b4c09bff6c4" ON "members" ("company_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ebddf816e97f763b7a0d36179" ON "members" ("company_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aa1cf9361d8b5c8e6d32b14e75" ON "members" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d5b799d50bc13ce547dbac3bb" ON "members" ("is_featured")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d75eefa29c161d6add2a30a10e" ON "members" ("status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_e0aa1c0f8c54664b4c09bff6c41" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_e0aa1c0f8c54664b4c09bff6c41"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d75eefa29c161d6add2a30a10e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4d5b799d50bc13ce547dbac3bb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aa1cf9361d8b5c8e6d32b14e75"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ebddf816e97f763b7a0d36179"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e0aa1c0f8c54664b4c09bff6c4"`,
    );
    await queryRunner.query(`DROP TABLE "members"`);
    await queryRunner.query(`DROP TYPE "public"."members_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."members_fee_type_enum"`);
  }
}
