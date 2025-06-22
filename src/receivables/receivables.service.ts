import { Injectable } from '@nestjs/common';
import { Receivable } from './entities/receivable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import { CreateReceivableDto } from './dto/create-receivable.dto';

@Injectable()
export class ReceivablesService {
  constructor(
    @InjectRepository(Receivable)
    private readonly receivableRepository: Repository<Receivable>,
  ) {}

  async create(dto: CreateReceivableDto, manager?: EntityManager): Promise<Receivable> {
    const repo = manager?.getRepository(Receivable) ?? this.receivableRepository;

    const receivable = new Receivable();

    receivable.status = dto.status;
    receivable.scheduledPaymentDate = new Date(dto.scheduledPaymentDate);
    receivable.subtotal = dto.subtotal;
    receivable.discount = dto.discount;
    receivable.total = dto.total;
    receivable.transactionId = dto.transactionId;

    return repo.save(receivable);
  }

  async getReceivablesByMerchant(merchantId: number): Promise<Receivable[]> {
    return this.receivableRepository
      .createQueryBuilder('receivable')
      .innerJoin('receivable.transaction', 'transaction')
      .innerJoin('transaction.merchant', 'merchant')
      .where('merchant.id = :merchantId', { merchantId })
      .getMany();
  }

  async getReceivablesTotalByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const start = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const end = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const result = await this.receivableRepository
      .createQueryBuilder('receivable')
      .select('SUM(receivable.total)', 'total')
      .where('receivable.scheduledPaymentDate BETWEEN :start AND :end', {
        start,
        end,
      })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
