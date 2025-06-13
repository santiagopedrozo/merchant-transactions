import { Controller, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetTransactionDto } from './dto/get-transaction.dto';

@ApiTags('Transactions')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Creates a merchant transaction and automatically generates a receivable with fees applied based on the card method.',
  })
  @ApiBody({
    type: CreateTransactionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: GetTransactionDto,
  })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    const transaction =
      await this.transactionService.create(createTransactionDto);
    return GetTransactionDto.toEntity(transaction);
  }
}
