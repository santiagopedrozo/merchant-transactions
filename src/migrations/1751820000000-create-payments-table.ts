import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreatePaymentsTable1751820000000 implements MigrationInterface {
  name = 'CreatePaymentsTable1751820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '255'
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            isNullable: false,
            default: "'USD'"
          },
          {
            name: 'method',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false
          },
          {
            name: 'externalProvider',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'externalId',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'externalMetadata',
            type: 'json',
            isNullable: true
          },
          {
            name: 'processedAt',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'failureReason',
            type: 'text',
            isNullable: true
          },
          {
            name: 'transactionId',
            type: 'int',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // Create indexes for better performance
    await queryRunner.createIndex(
      'payments',
      new Index('IDX_payments_external', ['externalProvider', 'externalId'])
    );

    await queryRunner.createIndex(
      'payments',
      new Index('IDX_payments_status', ['status'])
    );

    await queryRunner.createIndex(
      'payments',
      new Index('IDX_payments_transaction', ['transactionId'])
    );

    await queryRunner.createIndex(
      'payments',
      new Index('IDX_payments_created', ['createdAt'])
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}