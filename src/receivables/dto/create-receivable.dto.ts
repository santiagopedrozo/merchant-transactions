import { IsEnum, IsNumber, IsDateString, IsPositive } from 'class-validator';
import { ReceivableStatus } from '../entities/receivable.entity';

export class CreateReceivableDto {
  @IsEnum(ReceivableStatus)
  status: ReceivableStatus;

  @IsDateString()
  scheduledPaymentDate: string;

  @IsNumber()
  @IsPositive()
  subtotal: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  total: number;

  @IsNumber()
  transactionId: number;
}
