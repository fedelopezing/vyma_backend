import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1780062015993 implements MigrationInterface {
  name = 'InitialSchema1780062015993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" BIGSERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" text, "duration_minutes" integer NOT NULL, "price" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "professions" ("id" BIGSERIAL NOT NULL, "name" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, CONSTRAINT "UQ_b273de78f494fa9da6952ffa703" UNIQUE ("name"), CONSTRAINT "PK_9247c0d4b30fc6b796d59262058" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "schedule_breaks" ("id" SERIAL NOT NULL, "breakStart" TIME NOT NULL, "breakEnd" TIME NOT NULL, "scheduleId" integer, CONSTRAINT "PK_d8b9da07c5926fb28d2b7c371e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."schedules_dayofweek_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "schedules" ("id" SERIAL NOT NULL, "dayOfWeek" "public"."schedules_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "profileId" bigint, CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_documenttype_enum" AS ENUM('RUC', 'CI', 'PASSPORT', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_gender_enum" AS ENUM('none', 'male', 'female')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" BIGSERIAL NOT NULL, "document" character varying(50), "documentType" "public"."profiles_documenttype_enum" NOT NULL DEFAULT 'CI', "bio" text, "phone" character varying(20), "address" character varying(200), "city" character varying(50), "gender" "public"."profiles_gender_enum" NOT NULL DEFAULT 'none', "birth_date" TIMESTAMP, "avatarUrl" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "profession_id" bigint, "user_id" bigint NOT NULL, CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, CONSTRAINT "UQ_1c1e0637ecf1f6401beb9a68abe" UNIQUE ("action"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_provider_enum" AS ENUM('local', 'google', 'facebook', 'twitter', 'github', 'linkedin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(100) NOT NULL, "passwordHash" character varying(255) NOT NULL, "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'local', "providerId" character varying(255), "accessToken" text, "refreshToken" text, "tokenExpiry" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."provider" IS 'Proveedor de autenticación'; COMMENT ON COLUMN "users"."providerId" IS 'ID único del usuario en el proveedor de redes sociales'; COMMENT ON COLUMN "users"."accessToken" IS 'Token de acceso del proveedor (si necesitas interactuar con su API)'; COMMENT ON COLUMN "users"."refreshToken" IS 'Token de actualización (si aplica para la API del proveedor)'; COMMENT ON COLUMN "users"."tokenExpiry" IS 'Fecha de expiración del token de acceso (opcional)'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_951b8f1dfc94ac1d0301a14b7e" ON "users" ("uuid") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."news_categoria_enum" AS ENUM('NOTICIA', 'COMUNICADO', 'EVENTO_SOCIO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."news_estado_enum" AS ENUM('BORRADOR', 'PUBLICADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slugEs" character varying(255) NOT NULL, "slugEn" character varying(255), "tituloEs" character varying(255) NOT NULL, "tituloEn" character varying(255), "resumenEs" text NOT NULL, "resumenEn" text, "contenidoEs" text NOT NULL, "contenidoEn" text, "imagenPortada" character varying(500) NOT NULL, "categoria" "public"."news_categoria_enum" NOT NULL DEFAULT 'NOTICIA', "estado" "public"."news_estado_enum" NOT NULL DEFAULT 'BORRADOR', "autor_id" bigint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_253bdc6e0ca2764a2532f0da4a9" UNIQUE ("slugEs"), CONSTRAINT "UQ_1576f8d0c6b623100b738854305" UNIQUE ("slugEn"), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id")); COMMENT ON COLUMN "news"."contenidoEs" IS 'Almacena HTML enriquecido sanitizado'; COMMENT ON COLUMN "news"."contenidoEn" IS 'Almacena HTML enriquecido sanitizado bilingüe'; COMMENT ON COLUMN "news"."imagenPortada" IS 'Cloudinary URL'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_news_slug_es" ON "news" ("slugEs") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_news_slug_en" ON "news" ("slugEn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_news_filter" ON "news" ("estado", "categoria", "deletedAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("rolesId" integer NOT NULL, "permissionsId" integer NOT NULL, CONSTRAINT "PK_7931614007a93423204b4b73240" PRIMARY KEY ("rolesId", "permissionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cb93c5877d37e954e2aa59e52" ON "role_permissions" ("rolesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d422dabc78ff74a8dab6583da0" ON "role_permissions" ("permissionsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" ADD CONSTRAINT "FK_d25bfa71120389a1a6b62001803" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_026d07b928a9675c2b3aa2e37ab" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_b61819d9d3c02571f756d295abe" FOREIGN KEY ("profession_id") REFERENCES "professions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "FK_a01e4fe16c466c6b7e1c71a43b6" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_d422dabc78ff74a8dab6583da02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT "FK_a01e4fe16c466c6b7e1c71a43b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_b61819d9d3c02571f756d295abe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_026d07b928a9675c2b3aa2e37ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" DROP CONSTRAINT "FK_d25bfa71120389a1a6b62001803"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d422dabc78ff74a8dab6583da0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cb93c5877d37e954e2aa59e52"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_news_filter"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_news_slug_en"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_news_slug_es"`);
    await queryRunner.query(`DROP TABLE "news"`);
    await queryRunner.query(`DROP TYPE "public"."news_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."news_categoria_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_951b8f1dfc94ac1d0301a14b7e"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_documenttype_enum"`);
    await queryRunner.query(`DROP TABLE "schedules"`);
    await queryRunner.query(`DROP TYPE "public"."schedules_dayofweek_enum"`);
    await queryRunner.query(`DROP TABLE "schedule_breaks"`);
    await queryRunner.query(`DROP TABLE "professions"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
