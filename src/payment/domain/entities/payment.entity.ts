import { PaymentId } from '../value-objects/payment-id';
import { Money } from '../value-objects/money';
import { ExternalPaymentReference } from '../value-objects/external-payment-reference';
import { PaymentStatus, PaymentStatusTransitions } from '../enums/payment-status';
import { PaymentMethod } from '../enums/payment-method';

export class Payment {
  private constructor(
    private readonly id: PaymentId,
    private readonly amount: Money,
    private readonly method: PaymentMethod,
    private readonly status: PaymentStatus,
    private readonly description: string,
    private readonly externalReference?: ExternalPaymentReference,
    private readonly processedAt?: Date,
    private readonly failureReason?: string,
    private readonly createdAt: Date = new Date()
  ) {}

  // Factory methods
  static create(
    amount: Money,
    method: PaymentMethod,
    description: string
  ): Payment {
    return new Payment(
      PaymentId.generate(),
      amount,
      method,
      PaymentStatus.PENDING,
      description
    );
  }

  static reconstruct(
    id: PaymentId,
    amount: Money,
    method: PaymentMethod,
    status: PaymentStatus,
    description: string,
    externalReference?: ExternalPaymentReference,
    processedAt?: Date,
    failureReason?: string,
    createdAt?: Date
  ): Payment {
    return new Payment(
      id,
      amount,
      method,
      status,
      description,
      externalReference,
      processedAt,
      failureReason,
      createdAt
    );
  }

  // Business logic methods
  startProcessing(): Payment {
    PaymentStatusTransitions.validateTransition(this.status, PaymentStatus.PROCESSING);
    
    return new Payment(
      this.id,
      this.amount,
      this.method,
      PaymentStatus.PROCESSING,
      this.description,
      this.externalReference,
      this.processedAt,
      this.failureReason,
      this.createdAt
    );
  }

  confirm(externalReference: ExternalPaymentReference, processedAt: Date = new Date()): Payment {
    PaymentStatusTransitions.validateTransition(this.status, PaymentStatus.CONFIRMED);
    
    return new Payment(
      this.id,
      this.amount,
      this.method,
      PaymentStatus.CONFIRMED,
      this.description,
      externalReference,
      processedAt,
      undefined, // clear failure reason
      this.createdAt
    );
  }

  fail(failureReason: string): Payment {
    PaymentStatusTransitions.validateTransition(this.status, PaymentStatus.FAILED);
    
    return new Payment(
      this.id,
      this.amount,
      this.method,
      PaymentStatus.FAILED,
      this.description,
      this.externalReference,
      this.processedAt,
      failureReason,
      this.createdAt
    );
  }

  cancel(): Payment {
    PaymentStatusTransitions.validateTransition(this.status, PaymentStatus.CANCELLED);
    
    return new Payment(
      this.id,
      this.amount,
      this.method,
      PaymentStatus.CANCELLED,
      this.description,
      this.externalReference,
      this.processedAt,
      'Cancelled by user',
      this.createdAt
    );
  }

  refund(): Payment {
    PaymentStatusTransitions.validateTransition(this.status, PaymentStatus.REFUNDED);
    
    return new Payment(
      this.id,
      this.amount,
      this.method,
      PaymentStatus.REFUNDED,
      this.description,
      this.externalReference,
      this.processedAt,
      this.failureReason,
      this.createdAt
    );
  }

  // Domain queries
  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.status === PaymentStatus.PROCESSING;
  }

  isConfirmed(): boolean {
    return this.status === PaymentStatus.CONFIRMED;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  isTerminal(): boolean {
    return PaymentStatusTransitions.isTerminal(this.status);
  }

  canBeProcessed(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  // Getters
  getId(): PaymentId {
    return this.id;
  }

  getAmount(): Money {
    return this.amount;
  }

  getMethod(): PaymentMethod {
    return this.method;
  }

  getStatus(): PaymentStatus {
    return this.status;
  }

  getDescription(): string {
    return this.description;
  }

  getExternalReference(): ExternalPaymentReference | undefined {
    return this.externalReference;
  }

  getProcessedAt(): Date | undefined {
    return this.processedAt;
  }

  getFailureReason(): string | undefined {
    return this.failureReason;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  // Equality
  equals(other: Payment): boolean {
    return this.id.equals(other.id);
  }
}