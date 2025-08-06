export class PaymentId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Payment ID cannot be empty');
    }
  }

  static create(value: string): PaymentId {
    return new PaymentId(value);
  }

  static generate(): PaymentId {
    return new PaymentId(`payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PaymentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}