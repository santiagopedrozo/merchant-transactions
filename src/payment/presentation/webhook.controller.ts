import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { MockPspWebhookHandler } from '../infrastructure/adapters/webhook-handler.adapter';
import { WebhookEvent, WebhookEventType } from '../domain/ports/webhook-handler.port';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookHandler: MockPspWebhookHandler
  ) {}

  @Post('psp')
  @ApiExcludeEndpoint() // No documentar en Swagger por seguridad
  async handlePspWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature?: string
  ): Promise<{ success: boolean }> {
    
    try {
      this.logger.log(`Received webhook: ${payload.type}`);

      // Verificar firma (en un PSP real)
      if (signature && !this.webhookHandler.verifyWebhook(JSON.stringify(payload), signature)) {
        this.logger.warn('Invalid webhook signature');
        throw new Error('Invalid signature');
      }

      // Crear evento de webhook
      const event = new WebhookEvent(
        payload.id,
        this.mapEventType(payload.type),
        payload.data,
        new Date(payload.created * 1000),
        'mock-psp'
      );

      // Procesar webhook
      const result = await this.webhookHandler.handleWebhook(event);

      if (result.success) {
        this.logger.log(`Webhook processed successfully: ${payload.id}`);
        return { success: true };
      } else {
        this.logger.error(`Webhook processing failed: ${result.error}`);
        throw new Error(result.error || 'Webhook processing failed');
      }

    } catch (error) {
      this.logger.error(`Webhook handling failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapEventType(type: string): WebhookEventType {
    const eventTypeMap: Record<string, WebhookEventType> = {
      'payment.succeeded': WebhookEventType.PAYMENT_SUCCEEDED,
      'payment.failed': WebhookEventType.PAYMENT_FAILED,
      'payment.cancelled': WebhookEventType.PAYMENT_CANCELLED,
      'refund.created': WebhookEventType.REFUND_CREATED
    };

    return eventTypeMap[type] || WebhookEventType.PAYMENT_SUCCEEDED;
  }
}