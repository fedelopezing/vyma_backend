import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScheduleBreaksTable1750000000015
  implements MigrationInterface
{
  name = 'CreateScheduleBreaksTable1750000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "schedule_breaks" ("id" SERIAL NOT NULL, "breakStart" TIME NOT NULL, "breakEnd" TIME NOT NULL, "scheduleId" integer, "company_id" bigint NOT NULL, CONSTRAINT "PK_d8b9da07c5926fb28d2b7c371e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5de0609b9e1760faed608577ae" ON "schedule_breaks" ("company_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" ADD CONSTRAINT "FK_d25bfa71120389a1a6b62001803" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" ADD CONSTRAINT "FK_5de0609b9e1760faed608577aec" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" DROP CONSTRAINT "FK_5de0609b9e1760faed608577aec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_breaks" DROP CONSTRAINT "FK_d25bfa71120389a1a6b62001803"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5de0609b9e1760faed608577ae"`,
    );
    await queryRunner.query(`DROP TABLE "schedule_breaks"`);
  }
}
