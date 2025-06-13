import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Card } from '../../card/entities/card.entity';
import { Merchant } from '../../merchant/entities/merchant.entity';
import { Receivable } from '../../receivables/entities/receivable.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  value: number;

  @Column()
  description: string;

  @ManyToOne(() => Card, (card) => card.transactions)
  @JoinColumn({ name: 'cardId' })
  card: Card;

  @Column({ type: 'int' })
  cardId: number;

  @Column({ type: 'int' })
  merchantId: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.transactions)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToOne(() => Receivable, (receivable) => receivable.transaction)
  receivable: Receivable;
}
