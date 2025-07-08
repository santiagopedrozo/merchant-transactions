import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { AuthTokenGuard } from '../secrets/guards/auth-token.guard';

@ApiTags('Transactions')
@Controller('transaction')
@ApiSecurity('auth_token')
@UseGuards(AuthTokenGuard)
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
