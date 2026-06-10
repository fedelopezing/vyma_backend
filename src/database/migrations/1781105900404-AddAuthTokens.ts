import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthTokens1781105900404 implements MigrationInterface {
  name = 'AddAuthTokens1781105900404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activation_tokens" ("id" BIGSERIAL NOT NULL, "tokenHash" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, CONSTRAINT "REL_995711dd58f244ad95c829e3e3" UNIQUE ("user_id"), CONSTRAINT "PK_841f31a72cda6b2c39c861dbf0c" PRIMARY KEY ("id")); COMMENT ON COLUMN "activation_tokens"."tokenHash" IS 'Token de activación hasheado con bcrypt'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ce260f54fe07f6361f2ffceac" ON "activation_tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" BIGSERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "ipAddress" character varying(255), "userAgent" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")); COMMENT ON COLUMN "refresh_tokens"."tokenHash" IS 'Token hasheado con bcrypt'; COMMENT ON COLUMN "refresh_tokens"."ipAddress" IS 'IP de origen del login'; COMMENT ON COLUMN "refresh_tokens"."userAgent" IS 'User-Agent del cliente'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe3de112a4f7fd559c1d579509" ON "refresh_tokens" ("uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_56b91d98f71e3d1b649ed6e9f3" ON "refresh_tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "activation_tokens" ADD CONSTRAINT "FK_995711dd58f244ad95c829e3e38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activation_tokens" DROP CONSTRAINT "FK_995711dd58f244ad95c829e3e38"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_56b91d98f71e3d1b649ed6e9f3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe3de112a4f7fd559c1d579509"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ce260f54fe07f6361f2ffceac"`,
    );
    await queryRunner.query(`DROP TABLE "activation_tokens"`);
  }
}
