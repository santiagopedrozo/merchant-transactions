import { Injectable } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { Money, Currency } from '../../domain/value-objects/money';
import { PaymentMethod, PaymentMethodHelper } from '../../domain/enums/payment-method';
import { CardData } from '../../domain/ports/payment-processor.port';
import { CreatePaymentDto, CardDataDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class PaymentApplicationMapper {
  
  // DTO → Domain
  createPaymentDtoToDomain(dto: CreatePaymentDto): {
    amount: Money;
    method: PaymentMethod;
    description: string;
    cardData: CardData;
    metadata?: Record<string, any>;
  } {
    const amount = Money.fromCents(dto.amount, this.mapCurrency(dto.currency));
    const method = PaymentMethodHelper.fromString(dto.method);
    const cardData = this.mapCardData(dto.card);

    return {
      amount,
      method,
      description: dto.description,
      cardData,
      metadata: dto.metadata
    };
  }

  // Domain → Response DTO
  domainToResponseDto(payment: Payment): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    
    dto.id = payment.getId().getValue();
    dto.amount = payment.getAmount().toCents();
    dto.currency = payment.getAmount().getCurrency();
    dto.method = payment.getMethod();
    dto.status = payment.getStatus();
    dto.description = payment.getDescription();
    dto.externalId = payment.getExternalReference()?.getExternalId();
    dto.processedAt = payment.getProcessedAt()?.toISOString();
    dto.createdAt = payment.getCreatedAt().toISOString();
    dto.failureReason = payment.getFailureReason();

    return dto;
  }

  private mapCurrency(currencyString: string): Currency {
    const upperCurrency = currencyString.toUpperCase();
    if (Object.values(Currency).includes(upperCurrency as Currency)) {
      return upperCurrency as Currency;
    }
    throw new Error(`Unsupported currency: ${currencyString}`);
  }

  private mapCardData(cardDto: CardDataDto): CardData {
    return new CardData(
      cardDto.number,
      cardDto.expiryMonth,
      cardDto.expiryYear,
      cardDto.cvv,
      cardDto.holderName
    );
  }
}