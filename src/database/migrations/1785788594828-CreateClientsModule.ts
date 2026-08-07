import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsModule1785788594828 implements MigrationInterface {
  name = 'CreateClientsModule1785788594828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."client_representatives_documenttype_enum" AS ENUM('CEDULA_PY', 'PASAPORTE', 'RUC')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."client_representatives_role_enum" AS ENUM('PROPIETARIO', 'GERENTE', 'SOCIO', 'APODERADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "client_representatives" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientId" uuid NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "documentType" "public"."client_representatives_documenttype_enum" NOT NULL DEFAULT 'CEDULA_PY', "documentNumber" character varying(30) NOT NULL, "nationality" character varying(60), "gender" character varying(20), "maritalStatus" character varying(30), "role" "public"."client_representatives_role_enum" NOT NULL, "profession" character varying(100), "professionalRegistrationNumber" character varying(50), "roleStartDate" date, "roleEndDate" date, "sharesCount" integer, "shareValue" numeric(12,2), "totalSharesValue" numeric(14,2), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_392e55e9a71bc106770877aed3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bb1256e7e8dd76005dbaec436e" ON "client_representatives" ("clientId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."clients_clienttype_enum" AS ENUM('PERSONA_FISICA', 'PERSONA_JURIDICA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."clients_taxcondition_enum" AS ENUM('IVA_10', 'IVA_5', 'EXENTO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."clients_businessform_enum" AS ENUM('EIRL', 'CONDOMINIO', 'SUCESION', 'SA', 'SRL', 'SUCURSAL_EXT', 'SIMPLE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" bigint NOT NULL, "clientType" "public"."clients_clienttype_enum" NOT NULL, "ruc" character varying(20) NOT NULL, "businessName" character varying(200) NOT NULL, "fantasyName" character varying(200), "taxCondition" "public"."clients_taxcondition_enum" NOT NULL DEFAULT 'IVA_10', "businessForm" "public"."clients_businessform_enum", "firstName" character varying(100), "lastName" character varying(100), "birthDate" date, "emailPrimary" character varying(150), "emailSecondary" character varying(150), "phone" character varying(30), "fiscalDepartment" character varying(100), "fiscalDistrict" character varying(100), "fiscalLocality" character varying(100), "fiscalNeighborhood" character varying(100), "fiscalAddress" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5016a1ccedbea5f26d46376d6b" ON "clients" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8871e085e4697493f195e1ab05" ON "clients" ("ruc") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_contracttype_enum" AS ENUM('ABONO_FIJO', 'BOLSA_HORAS', 'EVENTO_ADICIONAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_status_enum" AS ENUM('ACTIVO', 'VENCIDO', 'RENOVANDO', 'CANCELADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "establishmentId" uuid NOT NULL, "contractType" "public"."contracts_contracttype_enum" NOT NULL, "status" "public"."contracts_status_enum" NOT NULL DEFAULT 'ACTIVO', "monthlyAmount" numeric(14,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PYG', "hoursBundleTotal" numeric(8,2), "hourlyRate" numeric(10,2), "startDate" date NOT NULL, "endDate" date, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b22208cbf6a7fd08b8ffa064b" ON "contracts" ("establishmentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "establishments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientId" uuid NOT NULL, "name" character varying(200) NOT NULL, "isHeadquarters" boolean NOT NULL DEFAULT false, "cadastralAccount" character varying(50), "padronNumber" character varying(30), "estateFincaNumber" character varying(30), "phone" character varying(30), "email" character varying(150), "address" character varying(255), "locationReference" character varying(255), "latitude" numeric(10,7), "longitude" numeric(10,7), "geofenceRadiusMeters" integer, "accessSchedules" jsonb, "requiredPpe" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_7fb6da6c365114ccb61b091bbdf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e99356359702b7ace983b196d3" ON "establishments" ("clientId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_establishment_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staffMemberId" bigint NOT NULL, "establishmentId" uuid NOT NULL, "startDate" date NOT NULL, "endDate" date, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_624156e9ede65faed423addfcfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fc0f8bc058133124daa859d7c" ON "staff_establishment_assignments" ("staffMemberId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d3b77e865200fae929183b9365" ON "staff_establishment_assignments" ("establishmentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47057fc79204af9b478ea05f29" ON "staff_establishment_assignments" ("staffMemberId", "establishmentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "client_representatives" ADD CONSTRAINT "FK_bb1256e7e8dd76005dbaec436e6" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_5016a1ccedbea5f26d46376d6b2" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_2b22208cbf6a7fd08b8ffa064b5" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "establishments" ADD CONSTRAINT "FK_e99356359702b7ace983b196d38" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_establishment_assignments" ADD CONSTRAINT "FK_7fc0f8bc058133124daa859d7c0" FOREIGN KEY ("staffMemberId") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_establishment_assignments" ADD CONSTRAINT "FK_d3b77e865200fae929183b93659" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_establishment_assignments" DROP CONSTRAINT "FK_d3b77e865200fae929183b93659"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_establishment_assignments" DROP CONSTRAINT "FK_7fc0f8bc058133124daa859d7c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "establishments" DROP CONSTRAINT "FK_e99356359702b7ace983b196d38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_2b22208cbf6a7fd08b8ffa064b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_5016a1ccedbea5f26d46376d6b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_representatives" DROP CONSTRAINT "FK_bb1256e7e8dd76005dbaec436e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47057fc79204af9b478ea05f29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d3b77e865200fae929183b9365"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fc0f8bc058133124daa859d7c"`,
    );
    await queryRunner.query(`DROP TABLE "staff_establishment_assignments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e99356359702b7ace983b196d3"`,
    );
    await queryRunner.query(`DROP TABLE "establishments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b22208cbf6a7fd08b8ffa064b"`,
    );
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_contracttype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8871e085e4697493f195e1ab05"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5016a1ccedbea5f26d46376d6b"`,
    );
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TYPE "public"."clients_businessform_enum"`);
    await queryRunner.query(`DROP TYPE "public"."clients_taxcondition_enum"`);
    await queryRunner.query(`DROP TYPE "public"."clients_clienttype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bb1256e7e8dd76005dbaec436e"`,
    );
    await queryRunner.query(`DROP TABLE "client_representatives"`);
    await queryRunner.query(
      `DROP TYPE "public"."client_representatives_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."client_representatives_documenttype_enum"`,
    );
  }
}
