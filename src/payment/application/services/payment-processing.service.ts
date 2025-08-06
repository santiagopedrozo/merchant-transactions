import { Injectable, Logger } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { Money } from '../../domain/value-objects/money';
import { PaymentMethod } from '../../domain/enums/payment-method';
import { ExternalPaymentReference } from '../../domain/value-objects/external-payment-reference';
import { FeeCalculationService } from '../../domain/services/fee-calculation.service';
import {
  IPaymentProcessor,
  ProcessPaymentRequest,
  CardData
} from '../../domain/ports/payment-processor.port';
import { IPaymentRepository } from '../../domain/ports/payment-repository.port';

export class PaymentProcessingResult {
  private constructor(
    public readonly success: boolean,
    public readonly payment?: Payment,
    public readonly error?: string
  ) {}

  static success(payment: Payment): PaymentProcessingResult {
    return new PaymentProcessingResult(true, payment);
  }

  static failure(error: string): PaymentProcessingResult {
    return new PaymentProcessingResult(false, undefined, error);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }
}

@Injectable()
export class PaymentProcessingService {
  private readonly logger = new Logger(PaymentProcessingService.name);

  constructor(
    private readonly paymentProcessor: IPaymentProcessor,
    private readonly paymentRepository: IPaymentRepository
  ) {}

  async processPayment(
    amount: Money,
    method: PaymentMethod,
    description: string,
    cardData: CardData,
    metadata?: Record<string, any>
  ): Promise<PaymentProcessingResult> {
    
    try {
      this.logger.log(`Processing payment: ${amount.toString()}, method: ${method}`);

      // 1. Create domain payment
      const payment = Payment.create(amount, method, description);

      // 2. Save payment in pending state
      await this.paymentRepository.save(payment);

      // 3. Process with external PSP
      const processingPayment = payment.startProcessing();
      await this.paymentRepository.updateStatus(processingPayment);

      const request = new ProcessPaymentRequest(
        amount,
        method,
        description,
        cardData,
        {
          ...metadata,
          domain_payment_id: payment.getId().getValue()
        }
      );

      const pspResult = await this.paymentProcessor.processPayment(request);

      if (pspResult.isFailure()) {
        const failedPayment = processingPayment.fail(pspResult.error!);
        await this.paymentRepository.updateStatus(failedPayment);
        return PaymentProcessingResult.failure(pspResult.error!);
      }

      // 4. Handle successful payment
      const externalRef = ExternalPaymentReference.mockPsp(
        pspResult.externalId!,
        pspResult.metadata
      );

      const confirmedPayment = processingPayment.confirm(externalRef);
      await this.paymentRepository.updateStatus(confirmedPayment);

      this.logger.log(`Payment processed successfully: ${confirmedPayment.getId().getValue()}`);
      return PaymentProcessingResult.success(confirmedPayment);

    } catch (error) {
      this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
      return PaymentProcessingResult.failure(`Processing error: ${error.message}`);
    }
  }

  async confirmPayment(
    externalReference: ExternalPaymentReference,
    processedAt: Date = new Date()
  ): Promise<void> {
    
    const payment = await this.paymentRepository.findByExternalReference(externalReference);
    if (!payment) {
      throw new Error(`Payment not found for external reference: ${externalReference.toString()}`);
    }

    if (payment.isConfirmed()) {
      this.logger.warn(`Payment already confirmed: ${payment.getId().getValue()}`);
      return;
    }

    const confirmedPayment = payment.confirm(externalReference, processedAt);
    await this.paymentRepository.updateStatus(confirmedPayment);

    this.logger.log(`Payment confirmed: ${payment.getId().getValue()}`);
  }

  async failPayment(
    externalReference: ExternalPaymentReference,
    failureReason: string
  ): Promise<void> {
    
    const payment = await this.paymentRepository.findByExternalReference(externalReference);
    if (!payment) {
      throw new Error(`Payment not found for external reference: ${externalReference.toString()}`);
    }

    if (payment.isTerminal()) {
      this.logger.warn(`Payment already in terminal state: ${payment.getId().getValue()}`);
      return;
    }

    const failedPayment = payment.fail(failureReason);
    await this.paymentRepository.updateStatus(failedPayment);

    this.logger.log(`Payment failed: ${payment.getId().getValue()}, reason: ${failureReason}`);
  }

  async cancelPayment(externalReference: ExternalPaymentReference): Promise<void> {
    const payment = await this.paymentRepository.findByExternalReference(externalReference);
    if (!payment) {
      throw new Error(`Payment not found for external reference: ${externalReference.toString()}`);
    }

    if (payment.isTerminal()) {
      this.logger.warn(`Payment already in terminal state: ${payment.getId().getValue()}`);
      return;
    }

    const cancelledPayment = payment.cancel();
    await this.paymentRepository.updateStatus(cancelledPayment);

    this.logger.log(`Payment cancelled: ${payment.getId().getValue()}`);
  }

  async refundPayment(externalReference: ExternalPaymentReference): Promise<void> {
    const payment = await this.paymentRepository.findByExternalReference(externalReference);
    if (!payment) {
      throw new Error(`Payment not found for external reference: ${externalReference.toString()}`);
    }

    if (!payment.isConfirmed()) {
      throw new Error(`Cannot refund non-confirmed payment: ${payment.getId().getValue()}`);
    }

    const refundedPayment = payment.refund();
    await this.paymentRepository.updateStatus(refundedPayment);

    this.logger.log(`Payment refunded: ${payment.getId().getValue()}`);
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const id = { getValue: () => paymentId } as any; // Quick hack for PaymentId
    return await this.paymentRepository.findById(id);
  }

  calculateFees(amount: Money, method: PaymentMethod) {
    return FeeCalculationService.calculate(amount, method);
  }
}