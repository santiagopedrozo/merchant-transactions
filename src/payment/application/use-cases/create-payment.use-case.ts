import { Injectable } from '@nestjs/common';
import { PaymentProcessingService } from '../services/payment-processing.service';
import { PaymentApplicationMapper } from '../mappers/payment-application.mapper';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly applicationMapper: PaymentApplicationMapper
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // 1. DTO → Domain
    const { amount, method, description, cardData, metadata } = 
      this.applicationMapper.createPaymentDtoToDomain(dto);

    // 2. Process payment
    const result = await this.paymentProcessingService.processPayment(
      amount,
      method,
      description,
      cardData,
      metadata
    );

    if (result.isFailure()) {
      throw new Error(result.error!);
    }

    // 3. Domain → Response DTO
    return this.applicationMapper.domainToResponseDto(result.payment!);
  }
}