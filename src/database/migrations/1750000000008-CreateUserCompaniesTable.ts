import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserCompaniesTable1750000000008
  implements MigrationInterface
{
  name = 'CreateUserCompaniesTable1750000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_companies" ("userId" bigint NOT NULL, "companyId" bigint NOT NULL, "roleId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b5b4fd1b21f221e3f91a438d93" PRIMARY KEY ("userId", "companyId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_295e2ec0606b47e50687ff46c3" ON "user_companies" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbcec9c4908de8338081b5bfeb" ON "user_companies" ("companyId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0b5b4fd1b21f221e3f91a438d9" ON "user_companies" ("userId", "companyId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" ADD CONSTRAINT "FK_295e2ec0606b47e50687ff46c34" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" ADD CONSTRAINT "FK_fbcec9c4908de8338081b5bfeb0" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" ADD CONSTRAINT "FK_533c70e5f26cbf874cdf2fbfff3" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_companies" DROP CONSTRAINT "FK_533c70e5f26cbf874cdf2fbfff3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" DROP CONSTRAINT "FK_fbcec9c4908de8338081b5bfeb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_companies" DROP CONSTRAINT "FK_295e2ec0606b47e50687ff46c34"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0b5b4fd1b21f221e3f91a438d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbcec9c4908de8338081b5bfeb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_295e2ec0606b47e50687ff46c3"`,
    );
    await queryRunner.query(`DROP TABLE "user_companies"`);
  }
}
