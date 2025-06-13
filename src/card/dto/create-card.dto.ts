import { IsEnum, IsNumber, IsString, Matches } from 'class-validator';
import { CardMethod } from '../entities/card.entity';

export class CreateCardDto {
  @IsNumber()
  lastFourNumbers: number;

  @IsString()
  holderName: string;

  @Matches(/^\d{2}\/\d{2}$/, {
    message: 'Expiration date must be in MM/YY format',
  })
  expirationDate: string;

  @IsEnum(CardMethod)
  method: CardMethod;

  @IsNumber()
  cvv: number;
}
