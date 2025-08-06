import { Money } from '../value-objects/money';
import { PaymentMethod } from '../enums/payment-method';

export class FeeCalculationResult {
  constructor(
    public readonly originalAmount: Money,
    public readonly feeAmount: Money,
    public readonly netAmount: Money,
    public readonly feePercentage: number
  ) {}
}

export class FeeCalculationService {
  private static readonly FEE_RATES: Record<PaymentMethod, number> = {
    [PaymentMethod.DEBIT_CARD]: 0.02, // 2%
    [PaymentMethod.CREDIT_CARD]: 0.04 // 4%
  };

  static calculate(amount: Money, method: PaymentMethod): FeeCalculationResult {
    const feeRate = this.FEE_RATES[method];
    if (feeRate === undefined) {
      throw new Error(`No fee rate defined for payment method: ${method}`);
    }

    const feeAmount = amount.multiply(feeRate);
    const netAmount = amount.subtract(feeAmount);

    return new FeeCalculationResult(
      amount,
      feeAmount,
      netAmount,
      feeRate
    );
  }

  static getFeeRate(method: PaymentMethod): number {
    const rate = this.FEE_RATES[method];
    if (rate === undefined) {
      throw new Error(`No fee rate defined for payment method: ${method}`);
    }
    return rate;
  }
}