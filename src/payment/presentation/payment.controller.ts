import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { PaymentProcessingService } from '../application/services/payment-processing.service';
import { PaymentApplicationMapper } from '../application/mappers/payment-application.mapper';
import { CreatePaymentDto } from '../application/dto/create-payment.dto';
import { PaymentResponseDto } from '../application/dto/payment-response.dto';
import { AuthTokenGuard } from '../../secrets/guards/auth-token.guard';

@ApiTags('Payments')
@Controller('payments')
@ApiSecurity('auth_token')
@UseGuards(AuthTokenGuard)
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly applicationMapper: PaymentApplicationMapper
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Process a payment',
    description: 'Process a payment using the configured PSP (Payment Service Provider)'
  })
  @ApiResponse({
    status: 201,
    description: 'Payment processed successfully',
    type: PaymentResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid payment data'
  })
  @ApiResponse({
    status: 422,
    description: 'Payment processing failed'
  })
  async createPayment(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return await this.createPaymentUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Retrieve payment details by payment ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: PaymentResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found'
  })
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentProcessingService.getPaymentById(id);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.applicationMapper.domainToResponseDto(payment);
  }
}