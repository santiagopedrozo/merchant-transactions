import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1751815796430 implements MigrationInterface {
  name = 'Migration1751815796430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "external_client" DROP COLUMN "isExposed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_client" DROP COLUMN "whiteListedIps"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_client" ADD "merchantId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_client" ADD CONSTRAINT "FK_c4cae7fcb5c268423400a4b1bfc" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "external_client" DROP CONSTRAINT "FK_c4cae7fcb5c268423400a4b1bfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_client" DROP COLUMN "merchantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_client" ADD "whiteListedIps" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_client" ADD "isExposed" boolean NOT NULL DEFAULT false`,
    );
  }
}
