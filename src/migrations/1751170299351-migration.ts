import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1751170299351 implements MigrationInterface {
  name = 'Migration1751170299351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "external_client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "apiKey" character varying NOT NULL, "token" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isExposed" boolean NOT NULL DEFAULT false, "whiteListedIps" text array, CONSTRAINT "UQ_ff8eb3d58b24ff3c814ffea7964" UNIQUE ("name"), CONSTRAINT "PK_9b3b5f1d560b8d832766c6cd5b9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "external_client"`);
  }
}
