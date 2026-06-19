import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1750000000005 implements MigrationInterface {
  name = 'CreateUsersTable1750000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_provider_enum" AS ENUM('local', 'google', 'facebook', 'twitter', 'github', 'linkedin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(100) NOT NULL, "passwordHash" character varying(255) NOT NULL, "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'local', "providerId" character varying(255), "accessToken" text, "refreshToken" text, "tokenExpiry" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "isSuperAdmin" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."provider" IS 'Proveedor de autenticación'; COMMENT ON COLUMN "users"."providerId" IS 'ID único del usuario en el proveedor de redes sociales'; COMMENT ON COLUMN "users"."accessToken" IS 'Token de acceso del proveedor (si necesitas interactuar con su API)'; COMMENT ON COLUMN "users"."refreshToken" IS 'Token de actualización (si aplica para la API del proveedor)'; COMMENT ON COLUMN "users"."tokenExpiry" IS 'Fecha de expiración del token de acceso (opcional)'; COMMENT ON COLUMN "users"."isSuperAdmin" IS 'Indicates if the user has super admin privileges across all tenants'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_951b8f1dfc94ac1d0301a14b7e" ON "users" ("uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_951b8f1dfc94ac1d0301a14b7e"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
  }
}
