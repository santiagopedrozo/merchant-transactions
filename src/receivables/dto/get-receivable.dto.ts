import { ApiProperty } from '@nestjs/swagger';
import { Receivable, ReceivableStatus } from '../entities/receivable.entity';

export class GetReceivableDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the receivable',
  })
  id: number;

  @ApiProperty({
    enum: ReceivableStatus,
    description: 'Current status of the receivable',
    example: ReceivableStatus.PAID,
  })
  status: ReceivableStatus;

  @ApiProperty({
    example: '2024-06-08T14:32:00.000Z',
    description: 'Timestamp indicating when the receivable was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: 10000.0,
    description: 'Subtotal amount before discounts',
  })
  subtotal: number;

  @ApiProperty({
    example: 100.0,
    description: 'Discount applied to the subtotal',
  })
  discount: number;

  @ApiProperty({
    example: 9900.0,
    description: 'Final total amount after discounts',
  })
  total: number;

  @ApiProperty({
    example: 5,
    description:
      'ID of the merchant associated with the receivable (via transaction)',
  })
  merchantId: number;

  @ApiProperty({
    example: 12,
    description: 'ID of the transaction linked to this receivable',
  })
  transactionId: number;

  static fromEntity(entity: Receivable): GetReceivableDto {
    const dto = new GetReceivableDto();

    dto.id = entity.id;
    dto.status = entity.status;
    dto.createdAt = entity.scheduledPaymentDate;
    dto.subtotal = Number(entity.subtotal);
    dto.discount = Number(entity.discount);
    dto.total = Number(entity.total);
    dto.transactionId = entity.transaction?.id;
    dto.merchantId = entity.transaction?.merchant?.id;

    return dto;
  }
}
