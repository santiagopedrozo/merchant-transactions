import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({ example: 'payment_123', description: 'Payment ID' })
  id: string;

  @ApiProperty({ example: 10000, description: 'Amount in cents' })
  amount: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  currency: string;

  @ApiProperty({ example: 'credit_card', description: 'Payment method' })
  method: string;

  @ApiProperty({ example: 'confirmed', description: 'Payment status' })
  status: string;

  @ApiProperty({ example: 'Payment for order #123', description: 'Payment description' })
  description: string;

  @ApiProperty({ example: 'pay_ext_123', description: 'External PSP payment ID', required: false })
  externalId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'When payment was processed', required: false })
  processedAt?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z', description: 'When payment was created' })
  createdAt: string;

  @ApiProperty({ example: 'Card declined', description: 'Failure reason if failed', required: false })
  failureReason?: string;
}