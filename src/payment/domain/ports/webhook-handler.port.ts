// Webhook event types
export class WebhookEvent {
  constructor(
    public readonly id: string,
    public readonly type: WebhookEventType,
    public readonly data: any,
    public readonly timestamp: Date,
    public readonly provider: string
  ) {}
}

export enum WebhookEventType {
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  REFUND_CREATED = 'refund.created'
}

export class WebhookProcessingResult {
  private constructor(
    public readonly success: boolean,
    public readonly processed: boolean,
    public readonly error?: string
  ) {}

  static success(processed: boolean = true): WebhookProcessingResult {
    return new WebhookProcessingResult(true, processed);
  }

  static failure(error: string): WebhookProcessingResult {
    return new WebhookProcessingResult(false, false, error);
  }

  static ignored(): WebhookProcessingResult {
    return new WebhookProcessingResult(true, false);
  }
}

export interface IWebhookHandler {
  /**
   * Handle incoming webhook from PSP
   */
  handleWebhook(event: WebhookEvent): Promise<WebhookProcessingResult>;

  /**
   * Verify webhook signature/authenticity
   */
  verifyWebhook(payload: string, signature: string): boolean;

  /**
   * Get supported event types
   */
  getSupportedEventTypes(): WebhookEventType[];
}