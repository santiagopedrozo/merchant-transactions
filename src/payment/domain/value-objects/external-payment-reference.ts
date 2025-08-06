export class ExternalPaymentReference {
  private constructor(
    private readonly provider: string,
    private readonly externalId: string,
    private readonly metadata?: Record<string, any>
  ) {
    if (!provider || provider.trim().length === 0) {
      throw new Error('Provider cannot be empty');
    }
    if (!externalId || externalId.trim().length === 0) {
      throw new Error('External ID cannot be empty');
    }
  }

  static create(provider: string, externalId: string, metadata?: Record<string, any>): ExternalPaymentReference {
    return new ExternalPaymentReference(provider, externalId, metadata);
  }

  static mockPsp(externalId: string, metadata?: any): ExternalPaymentReference {
    return new ExternalPaymentReference('mock-psp', externalId, metadata);
  }

  static stripe(paymentIntentId: string, metadata?: any): ExternalPaymentReference {
    return new ExternalPaymentReference('stripe', paymentIntentId, metadata);
  }

  getProvider(): string {
    return this.provider;
  }

  getExternalId(): string {
    return this.externalId;
  }

  getMetadata(): Record<string, any> | undefined {
    return this.metadata;
  }

  equals(other: ExternalPaymentReference): boolean {
    return this.provider === other.provider && 
           this.externalId === other.externalId;
  }

  toString(): string {
    return `${this.provider}:${this.externalId}`;
  }
}