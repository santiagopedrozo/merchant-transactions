import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModule } from '../card/card.module';
import { Transaction } from './entities/transaction.entity';
import { ReceivablesModule } from '../receivables/receivables.module';
import { MerchantModule } from '../merchant/merchant.module';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    CardModule,
    ReceivablesModule,
    MerchantModule,
    SecretsModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
