import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1749416176639 implements MigrationInterface {
  name = 'Migration1749416176639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cards_method_enum" AS ENUM('CREDIT', 'DEBIT', 'PREPAID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards" ("id" SERIAL NOT NULL, "method" "public"."cards_method_enum" NOT NULL, "lastFourNumbers" integer NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "holderName" character varying NOT NULL, "cvv" integer NOT NULL, CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchants" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_4fd312ef25f8e05ad47bfe7ed25" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receivables_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "receivables" ("id" SERIAL NOT NULL, "status" "public"."receivables_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL, "subtotal" numeric NOT NULL, "discount" numeric NOT NULL, "total" numeric NOT NULL, "transactionId" integer, CONSTRAINT "REL_d59f0cda3d3557bb2ffa598796" UNIQUE ("transactionId"), CONSTRAINT "PK_d77a2c19436083a2039cf06f1ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "value" numeric NOT NULL, "description" character varying NOT NULL, "cardId" integer, "merchantId" integer, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "receivables"`);
    await queryRunner.query(`DROP TYPE "public"."receivables_status_enum"`);
    await queryRunner.query(`DROP TABLE "merchants"`);
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TYPE "public"."cards_method_enum"`);
  }
}
