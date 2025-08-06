import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  IPaymentProcessor,
  ProcessPaymentRequest,
  ProcessPaymentResult,
  RefundRequest,
  RefundResult,
} from '../../domain/ports/payment-processor.port';

// Types for Mock PSP API responses
interface MockPspPaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: {
    type: string;
    card: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  };
  metadata: Record<string, any>;
  created: number;
  description: string;
}

interface MockPspRefundResponse {
  id: string;
  payment_id: string;
  amount: number;
  status: string;
  created: number;
  reason: string;
}

@Injectable()
export class MockPspAdapter implements IPaymentProcessor {
  private readonly logger = new Logger(MockPspAdapter.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('MOCK_PSP_URL', 'http://localhost:3001');
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
    try {
      this.logger.log(`Processing payment for amount: ${request.amount.toString()}`);

      const payload = {
        amount: request.amount.toCents(),
        currency: request.amount.getCurrency().toLowerCase(),
        description: request.description,
        payment_method: {
          type: 'card',
          card: {
            number: request.cardData.number,
            exp_month: request.cardData.expiryMonth,
            exp_year: request.cardData.expiryYear,
            cvc: request.cardData.cvv
          }
        },
        metadata: {
          ...request.metadata,
          holder_name: request.cardData.holderName,
          method: request.method
        }
      };

      const response = await firstValueFrom(
        this.httpService.post<MockPspPaymentResponse>(`${this.baseUrl}/v1/payment_intents`, payload)
      );

      const pspResponse = response.data;
      
      this.logger.log(`Payment processed. External ID: ${pspResponse.id}, Status: ${pspResponse.status}`);

      return ProcessPaymentResult.success(
        pspResponse.id,
        pspResponse.status,
        {
          brand: pspResponse.payment_method.card.brand,
          last4: pspResponse.payment_method.card.last4,
          created: pspResponse.created
        }
      );

    } catch (error) {
      this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
      
      if (error.response?.data) {
        return ProcessPaymentResult.failure(`PSP Error: ${error.response.data.message || 'Unknown error'}`);
      }
      
      return ProcessPaymentResult.failure(`Network error: ${error.message}`);
    }
  }

  async getPaymentStatus(externalId: string): Promise<string> {
    try {
      this.logger.log(`Getting payment status for: ${externalId}`);

      const response = await firstValueFrom(
        this.httpService.get<MockPspPaymentResponse>(`${this.baseUrl}/v1/payment_intents/${externalId}`)
      );

      return response.data.status;

    } catch (error) {
      this.logger.error(`Failed to get payment status: ${error.message}`);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    try {
      this.logger.log(`Processing refund for payment: ${request.externalPaymentId}`);

      const payload = {
        payment_intent: request.externalPaymentId,
        amount: request.amount?.toCents(),
        reason: request.reason || 'requested_by_customer'
      };

      const response = await firstValueFrom(
        this.httpService.post<MockPspRefundResponse>(`${this.baseUrl}/v1/refunds`, payload)
      );

      const refundResponse = response.data;

      this.logger.log(`Refund processed. Refund ID: ${refundResponse.id}`);

      return RefundResult.success(
        refundResponse.id,
        request.amount || null // Si no se especifica amount, es refund completo
      );

    } catch (error) {
      this.logger.error(`Refund processing failed: ${error.message}`);
      return RefundResult.failure(`Failed to process refund: ${error.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v1/payment_intents`, { timeout: 5000 })
      );
      return true;
    } catch (error) {
      this.logger.warn(`Mock PSP health check failed: ${error.message}`);
      return false;
    }
  }
}