export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  ARS = 'ARS'
}

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!Object.values(Currency).includes(currency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
  }

  static create(amount: number, currency: Currency = Currency.USD): Money {
    return new Money(amount, currency);
  }

  static fromCents(cents: number, currency: Currency = Currency.USD): Money {
    return new Money(cents / 100, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  toCents(): number {
    return Math.round(this.amount * 100);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}