import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchedulesTable1750000000014 implements MigrationInterface {
  name = 'CreateSchedulesTable1750000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."schedules_dayofweek_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "schedules" ("id" SERIAL NOT NULL, "dayOfWeek" "public"."schedules_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "profileId" bigint, "company_id" bigint NOT NULL, CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4312587691718bbddaf92b4c86" ON "schedules" ("company_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_026d07b928a9675c2b3aa2e37ab" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_4312587691718bbddaf92b4c866" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_4312587691718bbddaf92b4c866"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_026d07b928a9675c2b3aa2e37ab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4312587691718bbddaf92b4c86"`,
    );
    await queryRunner.query(`DROP TABLE "schedules"`);
    await queryRunner.query(`DROP TYPE "public"."schedules_dayofweek_enum"`);
  }
}
