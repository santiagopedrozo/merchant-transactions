import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';
import { Transaction } from '../../transaction/entities/transaction.entity';

export enum CardMethod {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Unique('UQ_card_unique_identity', [
  'lastFourNumbers',
  'holderName',
  'expirationDate',
  'method',
  'cvv',
])
@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: CardMethod })
  method: CardMethod;

  @Column()
  lastFourNumbers: number;

  @Column()
  expirationDate: Date;

  @Column()
  holderName: string;

  @Column()
  cvv: number;

  @OneToMany(() => Transaction, (transaction) => transaction.card)
  transactions: Transaction[];
}
