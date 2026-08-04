import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterStaffMembersTimestamptz1785850856825
  implements MigrationInterface
{
  name = 'AlterStaffMembersTimestamptz1785850856825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_members" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_members" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt"::TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_members" ALTER COLUMN "updatedAt" TYPE TIMESTAMP USING "updatedAt"::TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_members" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt"::TIMESTAMP`,
    );
  }
}
