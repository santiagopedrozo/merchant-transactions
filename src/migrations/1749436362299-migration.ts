import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1749436362299 implements MigrationInterface {
  name = 'Migration1749436362299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "receivables" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ADD "scheduledPaymentDate" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."cards_method_enum" RENAME TO "cards_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cards_method_enum" AS ENUM('CREDIT', 'DEBIT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ALTER COLUMN "method" TYPE "public"."cards_method_enum" USING "method"::"text"::"public"."cards_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."cards_method_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "receivables" DROP CONSTRAINT "FK_d59f0cda3d3557bb2ffa5987963"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."receivables_status_enum" RENAME TO "receivables_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receivables_status_enum" AS ENUM('WAITING_FUNDS', 'PAID')`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ALTER COLUMN "status" TYPE "public"."receivables_status_enum" USING "status"::"text"::"public"."receivables_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."receivables_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "receivables" ALTER COLUMN "transactionId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_d1dac70b33bf7a903782df5b637"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_88088ff46b6a3f09e1be51d35c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "cardId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "merchantId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD CONSTRAINT "UQ_card_unique_identity" UNIQUE ("lastFourNumbers", "holderName", "expirationDate", "method", "cvv")`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ADD CONSTRAINT "FK_d59f0cda3d3557bb2ffa5987963" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_d1dac70b33bf7a903782df5b637" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_88088ff46b6a3f09e1be51d35c4" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_88088ff46b6a3f09e1be51d35c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_d1dac70b33bf7a903782df5b637"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" DROP CONSTRAINT "FK_d59f0cda3d3557bb2ffa5987963"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" DROP CONSTRAINT "UQ_card_unique_identity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "merchantId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "cardId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_88088ff46b6a3f09e1be51d35c4" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_d1dac70b33bf7a903782df5b637" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ALTER COLUMN "transactionId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receivables_status_enum_old" AS ENUM('PENDING', 'PAID', 'CANCELED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ALTER COLUMN "status" TYPE "public"."receivables_status_enum_old" USING "status"::"text"::"public"."receivables_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."receivables_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."receivables_status_enum_old" RENAME TO "receivables_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ADD CONSTRAINT "FK_d59f0cda3d3557bb2ffa5987963" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cards_method_enum_old" AS ENUM('CREDIT', 'DEBIT', 'PREPAID')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ALTER COLUMN "method" TYPE "public"."cards_method_enum_old" USING "method"::"text"::"public"."cards_method_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."cards_method_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cards_method_enum_old" RENAME TO "cards_method_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" DROP COLUMN "scheduledPaymentDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receivables" ADD "createdAt" TIMESTAMP NOT NULL`,
    );
  }
}
