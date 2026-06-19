import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfilesTable1750000000009 implements MigrationInterface {
  name = 'CreateProfilesTable1750000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_b61819d9d3c02571f756d295abe" FOREIGN KEY ("profession_id") REFERENCES "professions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_b61819d9d3c02571f756d295abe"`,
    );
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_documenttype_enum"`);
  }
}
