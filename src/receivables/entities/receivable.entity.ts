import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from '../../transaction/entities/transaction.entity';

export enum ReceivableStatus {
  WAITING_FUNDS = 'WAITING_FUNDS',
  PAID = 'PAID',
}

@Entity('receivables')
export class Receivable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ReceivableStatus })
  status: ReceivableStatus;

  @Column()
  scheduledPaymentDate: Date;

  @Column('decimal')
  subtotal: number;

  @Column('decimal')
  discount: number;

  @Column('decimal')
  total: number;

  @Column({ type: 'int' })
  transactionId: number;

  @OneToOne(() => Transaction, (transaction) => transaction.receivable)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;
}
