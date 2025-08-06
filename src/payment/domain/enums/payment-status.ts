export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export class PaymentStatusTransitions {
  private static readonly VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.CONFIRMED, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
    [PaymentStatus.PROCESSING]: [PaymentStatus.CONFIRMED, PaymentStatus.FAILED],
    [PaymentStatus.CONFIRMED]: [PaymentStatus.REFUNDED],
    [PaymentStatus.FAILED]: [], // Terminal state
    [PaymentStatus.CANCELLED]: [], // Terminal state
    [PaymentStatus.REFUNDED]: [] // Terminal state
  };

  static canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static validateTransition(from: PaymentStatus, to: PaymentStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid payment status transition from ${from} to ${to}`);
    }
  }

  static isTerminal(status: PaymentStatus): boolean {
    return this.VALID_TRANSITIONS[status].length === 0;
  }
}