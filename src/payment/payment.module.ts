import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Domain
import { FeeCalculationService } from './domain/services/fee-calculation.service';

// Application
import { PaymentProcessingService } from './application/services/payment-processing.service';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { PaymentApplicationMapper } from './application/mappers/payment-application.mapper';

// Infrastructure
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity';
import { PaymentMapper } from './infrastructure/mappers/payment.mapper';
import { MockPspAdapter } from './infrastructure/adapters/mock-psp.adapter';
import { PaymentRepositoryAdapter } from './infrastructure/adapters/payment-repository.adapter';
import { MockPspWebhookHandler } from './infrastructure/adapters/webhook-handler.adapter';

// Ports
import { IPaymentProcessor } from './domain/ports/payment-processor.port';
import { IPaymentRepository } from './domain/ports/payment-repository.port';
import { IWebhookHandler } from './domain/ports/webhook-handler.port';

// Presentation
import { PaymentController } from './presentation/payment.controller';
import { WebhookController } from './presentation/webhook.controller';

// Import existing modules for dependencies
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    SecretsModule // For AuthTokenGuard
  ],
  controllers: [
    PaymentController,
    WebhookController
  ],
  providers: [
    // Domain Services
    FeeCalculationService,

    // Application Services
    PaymentProcessingService,
    CreatePaymentUseCase,
    PaymentApplicationMapper,

    // Infrastructure - Mappers
    PaymentMapper,

    // Infrastructure - Adapters (Ports Implementation)
    {
      provide: IPaymentProcessor,
      useClass: MockPspAdapter
    },
    {
      provide: IPaymentRepository,
      useClass: PaymentRepositoryAdapter
    },
    {
      provide: IWebhookHandler,
      useClass: MockPspWebhookHandler
    },

    // Concrete implementations (for direct injection where needed)
    MockPspAdapter,
    PaymentRepositoryAdapter,
    MockPspWebhookHandler
  ],
  exports: [
    PaymentProcessingService,
    IPaymentProcessor,
    IPaymentRepository
  ]
})
export class PaymentModule {}