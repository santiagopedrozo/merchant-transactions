import { Injectable, Logger } from '@nestjs/common';
import {
  IWebhookHandler,
  WebhookEvent,
  WebhookEventType,
  WebhookProcessingResult
} from '../../domain/ports/webhook-handler.port';
import { PaymentProcessingService } from '../../application/services/payment-processing.service';
import { ExternalPaymentReference } from '../../domain/value-objects/external-payment-reference';

@Injectable()
export class MockPspWebhookHandler implements IWebhookHandler {
  private readonly logger = new Logger(MockPspWebhookHandler.name);

  constructor(
    private readonly paymentProcessingService: PaymentProcessingService
  ) {}

  async handleWebhook(event: WebhookEvent): Promise<WebhookProcessingResult> {
    try {
      this.logger.log(`Processing webhook: ${event.type} for event ${event.id}`);

      switch (event.type) {
        case WebhookEventType.PAYMENT_SUCCEEDED:
          return await this.handlePaymentSucceeded(event);
        
        case WebhookEventType.PAYMENT_FAILED:
          return await this.handlePaymentFailed(event);
        
        case WebhookEventType.PAYMENT_CANCELLED:
          return await this.handlePaymentCancelled(event);
        
        case WebhookEventType.REFUND_CREATED:
          return await this.handleRefundCreated(event);
        
        default:
          this.logger.warn(`Unsupported webhook event type: ${event.type}`);
          return WebhookProcessingResult.ignored();
      }

    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      return WebhookProcessingResult.failure(error.message);
    }
  }

  private async handlePaymentSucceeded(event: WebhookEvent): Promise<WebhookProcessingResult> {
    const paymentData = event.data.object;
    const externalRef = ExternalPaymentReference.mockPsp(paymentData.id, paymentData);
    
    await this.paymentProcessingService.confirmPayment(
      externalRef,
      new Date(paymentData.created * 1000)
    );

    this.logger.log(`Payment confirmed via webhook: ${paymentData.id}`);
    return WebhookProcessingResult.success();
  }

  private async handlePaymentFailed(event: WebhookEvent): Promise<WebhookProcessingResult> {
    const paymentData = event.data.object;
    const externalRef = ExternalPaymentReference.mockPsp(paymentData.id);
    
    await this.paymentProcessingService.failPayment(
      externalRef,
      paymentData.failure_reason || 'Payment failed'
    );

    this.logger.log(`Payment failed via webhook: ${paymentData.id}`);
    return WebhookProcessingResult.success();
  }

  private async handlePaymentCancelled(event: WebhookEvent): Promise<WebhookProcessingResult> {
    const paymentData = event.data.object;
    const externalRef = ExternalPaymentReference.mockPsp(paymentData.id);
    
    await this.paymentProcessingService.cancelPayment(externalRef);

    this.logger.log(`Payment cancelled via webhook: ${paymentData.id}`);
    return WebhookProcessingResult.success();
  }

  private async handleRefundCreated(event: WebhookEvent): Promise<WebhookProcessingResult> {
    const refundData = event.data.object;
    const externalRef = ExternalPaymentReference.mockPsp(refundData.payment_id);
    
    await this.paymentProcessingService.refundPayment(externalRef);

    this.logger.log(`Payment refunded via webhook: ${refundData.payment_id}`);
    return WebhookProcessingResult.success();
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // En un PSP real, aquí verificarías la firma usando el secret del webhook
    // Para el mock, simplemente retornamos true
    this.logger.debug('Webhook signature verification (mock): OK');
    return true;
  }

  getSupportedEventTypes(): WebhookEventType[] {
    return [
      WebhookEventType.PAYMENT_SUCCEEDED,
      WebhookEventType.PAYMENT_FAILED,
      WebhookEventType.PAYMENT_CANCELLED,
      WebhookEventType.REFUND_CREATED
    ];
  }
}