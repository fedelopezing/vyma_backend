import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdsTable1783178643052 implements MigrationInterface {
  name = 'CreateAdsTable1783178643052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image_url_es" character varying(500) NOT NULL, "image_url_en" character varying(500), "link_url_es" character varying(500), "link_url_en" character varying(500), "alt_es" character varying(255), "alt_en" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "order" integer NOT NULL DEFAULT '0', "company_id" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a7af7d1998037a97076f758fc23" PRIMARY KEY ("id")); COMMENT ON COLUMN "ads"."image_url_es" IS 'Cloudinary URL for Spanish banner'; COMMENT ON COLUMN "ads"."image_url_en" IS 'Cloudinary URL for English banner'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ceb8ac1df66da08adcdd8f67ab" ON "ads" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ads_active_carousel" ON "ads" ("company_id", "is_active", "order", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ads" ADD CONSTRAINT "FK_ceb8ac1df66da08adcdd8f67ab9" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads" DROP CONSTRAINT "FK_ceb8ac1df66da08adcdd8f67ab9"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ads_active_carousel"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ceb8ac1df66da08adcdd8f67ab"`,
    );
    await queryRunner.query(`DROP TABLE "ads"`);
  }
}
