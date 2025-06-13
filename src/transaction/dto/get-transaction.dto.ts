import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../entities/transaction.entity';

export class GetTransactionDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the transaction',
  })
  id: number;

  @ApiProperty({
    example: '100.10',
    description: 'Transaction amount',
  })
  value: number;

  @ApiProperty({
    example: 'T-Shirt Black M',
    description: 'Description of the transaction',
  })
  description: string;

  static toEntity(dto: GetTransactionDto): Transaction {
    const entity = new Transaction();
    entity.id = dto.id;
    entity.value = dto.value;
    entity.description = dto.description;
    return entity;
  }
}
