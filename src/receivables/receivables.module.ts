import { Module } from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { ReceivablesController } from './receivables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receivable } from './entities/receivable.entity';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Receivable]), SecretsModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
