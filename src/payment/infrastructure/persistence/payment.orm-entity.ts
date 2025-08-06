import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class PaymentOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  method: string;

  @Column()
  status: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  externalProvider?: string;

  @Column({ nullable: true })
  externalId?: string;

  @Column('json', { nullable: true })
  externalMetadata?: Record<string, any>;

  @Column({ nullable: true })
  processedAt?: Date;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ nullable: true })
  transactionId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}