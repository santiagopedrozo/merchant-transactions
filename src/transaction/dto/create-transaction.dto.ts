import { IsEnum, IsNumber, IsString, Matches } from 'class-validator';
import { CardMethod } from '../../card/entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @IsNumber()
  @ApiProperty({
    description: 'owner merchant of the transaction',
  })
  merchantId: number;

  @IsNumber()
  @ApiProperty({
    example: '100.10',
    description: 'Transaction amount with two decimal places (as a string)',
  })
  subtotal: number;

  @IsString()
  @ApiProperty({
    example: 'T-Shirt Black M',
    description: 'Description of the purchased item or service',
  })
  description: string;

  @IsEnum(CardMethod)
  @ApiProperty({
    enum: CardMethod,
    example: CardMethod.CREDIT,
    description: 'Payment method used for the transaction',
  })
  method: CardMethod;

  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the cardholder',
  })
  cardHolderName: string;

  @Matches(/^\d{13,19}$/, {
    message: 'Card number must be between 13 and 19 digits',
  })
  @ApiProperty({
    example: '343893520250758',
    description: 'Full credit card number (valid format required)',
  })
  cardNumber: string;

  @Matches(/^\d{2}\/\d{2}$/, {
    message: 'Expiration date must be in MM/YY format',
  })
  @ApiProperty({
    example: '12/26',
    description: 'Card expiration date in MM/YY format',
  })
  cardExpirationDate: string;

  @IsNumber()
  @ApiProperty({
    example: '123',
    description: 'CVV of the card (used only during transaction creation)',
  })
  cardCvv: number;
}
