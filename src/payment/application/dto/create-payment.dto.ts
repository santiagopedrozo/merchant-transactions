import { IsEnum, IsNumber, IsString, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CardDataDto {
  @IsString()
  @ApiProperty({ example: '4242424242424242', description: 'Card number' })
  number: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 12, description: 'Expiry month (1-12)' })
  expiryMonth: number;

  @IsNumber()
  @Min(2024)
  @ApiProperty({ example: 2025, description: 'Expiry year' })
  expiryYear: number;

  @IsString()
  @ApiProperty({ example: '123', description: 'CVV' })
  cvv: string;

  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'Cardholder name' })
  holderName: string;
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 10000, description: 'Amount in cents' })
  amount: number;

  @IsString()
  @IsEnum(['USD', 'EUR', 'ARS'])
  @ApiProperty({ example: 'USD', description: 'Currency code' })
  currency: string;

  @IsString()
  @IsEnum(['credit_card', 'debit_card'])
  @ApiProperty({ example: 'credit_card', description: 'Payment method' })
  method: string;

  @IsString()
  @ApiProperty({ example: 'Payment for order #123', description: 'Payment description' })
  description: string;

  @ValidateNested()
  @Type(() => CardDataDto)
  @ApiProperty({ type: CardDataDto, description: 'Card data' })
  card: CardDataDto;

  @IsOptional()
  @ApiProperty({ example: { orderId: '123' }, description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;
}