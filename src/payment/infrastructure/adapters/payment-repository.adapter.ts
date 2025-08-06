import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaymentRepository } from '../../domain/ports/payment-repository.port';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentId } from '../../domain/value-objects/payment-id';
import { ExternalPaymentReference } from '../../domain/value-objects/external-payment-reference';
import { PaymentOrmEntity } from '../persistence/payment.orm-entity';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class PaymentRepositoryAdapter implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly ormRepository: Repository<PaymentOrmEntity>,
    private readonly paymentMapper: PaymentMapper
  ) {}

  async save(payment: Payment): Promise<void> {
    const ormEntity = this.paymentMapper.domainToOrm(payment);
    await this.ormRepository.save(ormEntity);
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() }
    });

    if (!ormEntity) {
      return null;
    }

    return this.paymentMapper.ormToDomain(ormEntity);
  }

  async findByExternalReference(reference: ExternalPaymentReference): Promise<Payment | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {
        externalProvider: reference.getProvider(),
        externalId: reference.getExternalId()
      }
    });

    if (!ormEntity) {
      return null;
    }

    return this.paymentMapper.ormToDomain(ormEntity);
  }

  async findByTransactionId(transactionId: number): Promise<Payment[]> {
    const ormEntities = await this.ormRepository.find({
      where: { transactionId }
    });

    return ormEntities.map(entity => this.paymentMapper.ormToDomain(entity));
  }

  async findByMerchantId(merchantId: number): Promise<Payment[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('payment')
      .innerJoin('transactions', 'transaction', 'transaction.id = payment.transactionId')
      .where('transaction.merchantId = :merchantId', { merchantId })
      .getMany();

    return ormEntities.map(entity => this.paymentMapper.ormToDomain(entity));
  }

  async updateStatus(payment: Payment): Promise<void> {
    await this.ormRepository.update(
      { id: payment.getId().getValue() },
      {
        status: payment.getStatus(),
        externalProvider: payment.getExternalReference()?.getProvider(),
        externalId: payment.getExternalReference()?.getExternalId(),
        externalMetadata: payment.getExternalReference()?.getMetadata(),
        processedAt: payment.getProcessedAt(),
        failureReason: payment.getFailureReason()
      }
    );
  }
}