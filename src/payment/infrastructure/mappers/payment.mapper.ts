import { Injectable } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentOrmEntity } from '../persistence/payment.orm-entity';
import { PaymentId } from '../../domain/value-objects/payment-id';
import { Money, Currency } from '../../domain/value-objects/money';
import { ExternalPaymentReference } from '../../domain/value-objects/external-payment-reference';
import { PaymentStatus } from '../../domain/enums/payment-status';
import { PaymentMethod } from '../../domain/enums/payment-method';

@Injectable()
export class PaymentMapper {
  
  domainToOrm(payment: Payment): PaymentOrmEntity {
    const ormEntity = new PaymentOrmEntity();
    
    ormEntity.id = payment.getId().getValue();
    ormEntity.amount = payment.getAmount().getAmount();
    ormEntity.currency = payment.getAmount().getCurrency();
    ormEntity.method = payment.getMethod();
    ormEntity.status = payment.getStatus();
    ormEntity.description = payment.getDescription();
    ormEntity.externalProvider = payment.getExternalReference()?.getProvider();
    ormEntity.externalId = payment.getExternalReference()?.getExternalId();
    ormEntity.externalMetadata = payment.getExternalReference()?.getMetadata();
    ormEntity.processedAt = payment.getProcessedAt();
    ormEntity.failureReason = payment.getFailureReason();
    ormEntity.createdAt = payment.getCreatedAt();
    
    return ormEntity;
  }

  ormToDomain(ormEntity: PaymentOrmEntity): Payment {
    const paymentId = PaymentId.create(ormEntity.id);
    const money = Money.create(ormEntity.amount, ormEntity.currency as Currency);
    const method = ormEntity.method as PaymentMethod;
    const status = ormEntity.status as PaymentStatus;
    
    let externalReference: ExternalPaymentReference | undefined;
    if (ormEntity.externalProvider && ormEntity.externalId) {
      externalReference = ExternalPaymentReference.create(
        ormEntity.externalProvider,
        ormEntity.externalId,
        ormEntity.externalMetadata
      );
    }

    return Payment.reconstruct(
      paymentId,
      money,
      method,
      status,
      ormEntity.description,
      externalReference,
      ormEntity.processedAt,
      ormEntity.failureReason,
      ormEntity.createdAt
    );
  }
}