import {BadRequestException, Injectable} from '@nestjs/common';
import { Card, CardMethod } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { ReceivableStatus } from '../receivables/entities/receivable.entity';
import { BillingCalculationResultDto } from './dto/billing-calculation-result.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async createOrFind(dto: CreateCardDto): Promise<Card> {
    this.validateExpirationDate(dto.expirationDate);

    const existingCard = await this.cardRepository.findOne({
      where: {
        lastFourNumbers: dto.lastFourNumbers,
        holderName: dto.holderName,
        expirationDate: new Date(dto.expirationDate),
        method: dto.method,
        cvv: dto.cvv,
      },
    });

    if (existingCard) return existingCard;

    const newCard = this.cardRepository.create({
      lastFourNumbers: dto.lastFourNumbers,
      holderName: dto.holderName,
      expirationDate: dto.expirationDate,
      method: dto.method,
      cvv: dto.cvv,
    });

    return this.cardRepository.save(newCard);
  }

  calculateBillingData(
    transactionValue: number,
    method: CardMethod,
  ): BillingCalculationResultDto {
    const feeRate = method === CardMethod.DEBIT ? 0.02 : 0.04;
    const status =
      method === CardMethod.DEBIT
        ? ReceivableStatus.PAID
        : ReceivableStatus.WAITING_FUNDS;
    const paymentDate =
      method === CardMethod.DEBIT
        ? new Date()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const feeAmount = parseFloat((transactionValue * feeRate).toFixed(2));
    const total = parseFloat((transactionValue - feeAmount).toFixed(2));

    return {
      status,
      paymentDate,
      feeAmount,
      total,
    };
  }

  private validateExpirationDate(expirationDate: Date | string): void {
    const date = typeof expirationDate === 'string'
        ? this.parseExpirationDate(expirationDate)
        : new Date(expirationDate);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const expYear = date.getFullYear();
    const expMonth = date.getMonth(); // 0-indexed

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      throw new BadRequestException('Card is expired');
    }
  }

  private parseExpirationDate(mmYy: string): Date {
    const [monthStr, yearStr] = mmYy.split('/');
    const month = parseInt(monthStr) - 1;
    const year = 2000 + parseInt(yearStr);
    return new Date(year, month + 1, 0);
  }
}
