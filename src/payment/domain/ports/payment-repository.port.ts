import { Payment } from '../entities/payment.entity';
import { PaymentId } from '../value-objects/payment-id';
import { ExternalPaymentReference } from '../value-objects/external-payment-reference';

export interface IPaymentRepository {
  /**
   * Save a payment
   */
  save(payment: Payment): Promise<void>;

  /**
   * Find payment by domain ID
   */
  findById(id: PaymentId): Promise<Payment | null>;

  /**
   * Find payment by external reference
   */
  findByExternalReference(reference: ExternalPaymentReference): Promise<Payment | null>;

  /**
   * Find payments by transaction ID
   */
  findByTransactionId(transactionId: number): Promise<Payment[]>;

  /**
   * Find all payments for a merchant
   */
  findByMerchantId(merchantId: number): Promise<Payment[]>;

  /**
   * Update payment status
   */
  updateStatus(payment: Payment): Promise<void>;
}