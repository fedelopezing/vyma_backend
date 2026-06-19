import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsTable1750000000012 implements MigrationInterface {
  name = 'CreateNewsTable1750000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."news_categoria_enum" AS ENUM('NOTICIA', 'COMUNICADO', 'EVENTO_SOCIO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."news_estado_enum" AS ENUM('BORRADOR', 'PUBLICADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slugEs" character varying(255) NOT NULL, "slugEn" character varying(255), "tituloEs" character varying(255) NOT NULL, "tituloEn" character varying(255), "resumenEs" text NOT NULL, "resumenEn" text, "contenidoEs" text NOT NULL, "contenidoEn" text, "imagenPortada" character varying(500) NOT NULL, "categoria" "public"."news_categoria_enum" NOT NULL DEFAULT 'NOTICIA', "estado" "public"."news_estado_enum" NOT NULL DEFAULT 'BORRADOR', "autor_id" bigint NOT NULL, "company_id" bigint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_253bdc6e0ca2764a2532f0da4a9" UNIQUE ("slugEs"), CONSTRAINT "UQ_1576f8d0c6b623100b738854305" UNIQUE ("slugEn"), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id")); COMMENT ON COLUMN "news"."contenidoEs" IS 'Almacena HTML enriquecido sanitizado'; COMMENT ON COLUMN "news"."contenidoEn" IS 'Almacena HTML enriquecido sanitizado bilingüe'; COMMENT ON COLUMN "news"."imagenPortada" IS 'Cloudinary URL'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_news_slug_es" ON "news" ("slugEs")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_news_slug_en" ON "news" ("slugEn")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_news_filter" ON "news" ("estado", "categoria", "deletedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7cdd3524a000b1cde5683fc80b" ON "news" ("company_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "FK_a01e4fe16c466c6b7e1c71a43b6" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE "news" DROP CONSTRAINT "FK_a01e4fe16c466c6b7e1c71a43b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7cdd3524a000b1cde5683fc80b"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_news_filter"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_news_slug_en"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_news_slug_es"`);
    await queryRunner.query(`DROP TABLE "news"`);
    await queryRunner.query(`DROP TYPE "public"."news_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."news_categoria_enum"`);
  }
}
