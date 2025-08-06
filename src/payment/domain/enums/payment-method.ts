export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card'
}

export class PaymentMethodHelper {
  static fromString(method: string): PaymentMethod {
    const upperMethod = method.toUpperCase();
    switch (upperMethod) {
      case 'CREDIT':
      case 'CREDIT_CARD':
        return PaymentMethod.CREDIT_CARD;
      case 'DEBIT':
      case 'DEBIT_CARD':
        return PaymentMethod.DEBIT_CARD;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  static isValid(method: string): boolean {
    try {
      PaymentMethodHelper.fromString(method);
      return true;
    } catch {
      return false;
    }
  }
}