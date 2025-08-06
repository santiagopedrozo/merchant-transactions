import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MerchantModule } from './merchant/merchant.module';
import { CardModule } from './card/card.module';
import { TransactionModule } from './transaction/transaction.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { PaymentModule } from './payment/payment.module';
import { getTypeOrmModuleFactory } from './shared/typeorm/typeorm.module.factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsModule } from './secrets/secrets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmModuleFactory,
      inject: [ConfigService],
    }),
    MerchantModule,
    CardModule,
    TransactionModule,
    ReceivablesModule,
    PaymentModule,
    SecretsModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
