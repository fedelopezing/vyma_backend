import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivationTokensTable1750000000010
  implements MigrationInterface
{
  name = 'CreateActivationTokensTable1750000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activation_tokens" ("id" BIGSERIAL NOT NULL, "tokenHash" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, CONSTRAINT "REL_995711dd58f244ad95c829e3e3" UNIQUE ("user_id"), CONSTRAINT "PK_841f31a72cda6b2c39c861dbf0c" PRIMARY KEY ("id")); COMMENT ON COLUMN "activation_tokens"."tokenHash" IS 'Token de activación hasheado con bcrypt'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ce260f54fe07f6361f2ffceac" ON "activation_tokens" ("expiresAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activation_tokens" ADD CONSTRAINT "FK_995711dd58f244ad95c829e3e38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activation_tokens" DROP CONSTRAINT "FK_995711dd58f244ad95c829e3e38"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ce260f54fe07f6361f2ffceac"`,
    );
    await queryRunner.query(`DROP TABLE "activation_tokens"`);
  }
}
