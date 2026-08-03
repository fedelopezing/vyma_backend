import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffMembersTable1785531826159
  implements MigrationInterface
{
  name = 'CreateStaffMembersTable1785531826159';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."staff_members_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_members_contracttype_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CASUAL', 'CONTRACTOR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_members_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_members_paymenttype_enum" AS ENUM('MONTHLY', 'HOURLY', 'BIWEEKLY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_members" ("id" BIGSERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" bigint NOT NULL, "userId" bigint, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "nationalId" character varying(20) NOT NULL, "phone" character varying(30), "email" character varying(150), "address" character varying(255), "gender" "public"."staff_members_gender_enum" NOT NULL DEFAULT 'OTHER', "birthDate" date, "position" character varying(100) NOT NULL DEFAULT 'Personal de Limpieza', "contractType" "public"."staff_members_contracttype_enum" NOT NULL DEFAULT 'FULL_TIME', "status" "public"."staff_members_status_enum" NOT NULL DEFAULT 'ACTIVE', "hireDate" date NOT NULL, "terminationDate" date, "assignedLocation" character varying(255), "baseSalary" numeric(12,2) NOT NULL DEFAULT '0', "paymentType" "public"."staff_members_paymenttype_enum" NOT NULL DEFAULT 'MONTHLY', "hourlyRate" numeric(10,2), "hasIpsCoverage" boolean NOT NULL DEFAULT true, "bankName" character varying(100), "bankAccountNumber" character varying(50), "documentUrls" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cdad75efe024402db5d51140960" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7e3e0e69f3dc5ecb1a31e30d27" ON "staff_members" ("uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6204af3c5c4af133738f64d4c6" ON "staff_members" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e360dda42b3876dc5a856d44ca" ON "staff_members" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d73b90602a88320ee1d6ed002f" ON "staff_members" ("nationalId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_members" ADD CONSTRAINT "FK_6204af3c5c4af133738f64d4c60" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_members" ADD CONSTRAINT "FK_e360dda42b3876dc5a856d44ca4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_members" DROP CONSTRAINT "FK_e360dda42b3876dc5a856d44ca4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_members" DROP CONSTRAINT "FK_6204af3c5c4af133738f64d4c60"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d73b90602a88320ee1d6ed002f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e360dda42b3876dc5a856d44ca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6204af3c5c4af133738f64d4c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e3e0e69f3dc5ecb1a31e30d27"`,
    );
    await queryRunner.query(`DROP TABLE "staff_members"`);
    await queryRunner.query(
      `DROP TYPE "public"."staff_members_paymenttype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."staff_members_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."staff_members_contracttype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."staff_members_gender_enum"`);
  }
}
