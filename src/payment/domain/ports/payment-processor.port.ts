import { Money } from '../value-objects/money';
import { PaymentMethod } from '../enums/payment-method';

// Request DTOs for the port
export class ProcessPaymentRequest {
  constructor(
    public readonly amount: Money,
    public readonly method: PaymentMethod,
    public readonly description: string,
    public readonly cardData: CardData,
    public readonly metadata?: Record<string, any>
  ) {}
}

export class CardData {
  constructor(
    public readonly number: string,
    public readonly expiryMonth: number,
    public readonly expiryYear: number,
    public readonly cvv: string,
    public readonly holderName: string
  ) {}

  getLast4(): string {
    return this.number.slice(-4);
  }
}

// Response DTOs for the port
export class ProcessPaymentResult {
  private constructor(
    public readonly success: boolean,
    public readonly externalId?: string,
    public readonly status?: string,
    public readonly error?: string,
    public readonly metadata?: Record<string, any>
  ) {}

  static success(externalId: string, status: string, metadata?: Record<string, any>): ProcessPaymentResult {
    return new ProcessPaymentResult(true, externalId, status, undefined, metadata);
  }

  static failure(error: string): ProcessPaymentResult {
    return new ProcessPaymentResult(false, undefined, undefined, error);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }
}

export class RefundRequest {
  constructor(
    public readonly externalPaymentId: string,
    public readonly amount?: Money, // Si no se especifica, reembolso completo
    public readonly reason?: string
  ) {}
}

export class RefundResult {
  private constructor(
    public readonly success: boolean,
    public readonly refundId?: string,
    public readonly amount?: Money,
    public readonly error?: string
  ) {}

  static success(refundId: string, amount: Money): RefundResult {
    return new RefundResult(true, refundId, amount);
  }

  static failure(error: string): RefundResult {
    return new RefundResult(false, undefined, undefined, error);
  }
}

// Main port interface
export interface IPaymentProcessor {
  /**
   * Process a payment with the external PSP
   */
  processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResult>;

  /**
   * Get payment status from external PSP
   */
  getPaymentStatus(externalId: string): Promise<string>;

  /**
   * Refund a payment
   */
  refundPayment(request: RefundRequest): Promise<RefundResult>;

  /**
   * Check if the PSP is available
   */
  healthCheck(): Promise<boolean>;
}