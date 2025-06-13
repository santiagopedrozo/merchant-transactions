import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from '../card/card.service';
import { ReceivablesService } from '../receivables/receivables.service';
import { MerchantService } from '../merchant/merchant.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly cardService: CardService,
    private readonly receivableService: ReceivablesService,
    private readonly merchantService: MerchantService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const foundMerchant = await this.merchantService.findById(
      createTransactionDto.merchantId,
    );

    if (!foundMerchant) {
      throw new NotFoundException(
        `Merchant with id ${createTransactionDto.merchantId} not found`,
      );
    }

    const foundCard = await this.cardService.createOrFind({
      lastFourNumbers: +createTransactionDto.cardNumber.slice(-4),
      holderName: createTransactionDto.cardHolderName,
      expirationDate: createTransactionDto.cardExpirationDate,
      method: createTransactionDto.method,
      cvv: createTransactionDto.cardCvv,
    });

    const billingCalculation = this.cardService.calculateBillingData(
      createTransactionDto.subtotal,
      createTransactionDto.method,
    );

    const transactionToSave = this.transactionRepository.create({
      merchantId: createTransactionDto.merchantId,
      value: billingCalculation.total,
      description: createTransactionDto.description,
      cardId: foundCard.id,
    });

    const transaction =
      await this.transactionRepository.save(transactionToSave);

    await this.receivableService.create({
      status: billingCalculation.status,
      scheduledPaymentDate: billingCalculation.paymentDate.toDateString(),
      subtotal: createTransactionDto.subtotal,
      discount: billingCalculation.feeAmount,
      total: billingCalculation.total,
      transactionId: transaction.id,
    });

    return transaction;
  }
}
