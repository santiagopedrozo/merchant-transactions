import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { GetReceivableDto } from './dto/get-receivable.dto';
import { AuthTokenGuard } from '../secrets/guards/auth-token.guard';

@ApiTags('Receivables')
@Controller('receivables')
@ApiSecurity('auth_token')
@UseGuards(AuthTokenGuard)
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get('/merchant/:merchantId')
  @ApiOperation({ summary: 'Get receivables by merchant ID' })
  @ApiParam({
    name: 'merchantId',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Receivables retrieved successfully',
    type: [GetReceivableDto],
  })
  async getByMerchant(@Param('merchantId', ParseIntPipe) merchantId: number) {
    const receivables =
      await this.receivablesService.getReceivablesByMerchant(merchantId);
    return receivables.map((r) => GetReceivableDto.fromEntity(r));
  }

  @Get('/total')
  @ApiOperation({ summary: 'Get total receivables by date range' })
  @ApiQuery({ name: 'startDate', type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', type: String, example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Total calculated successfully' })
  async getTotalByPeriod(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return {
      total: await this.receivablesService.getReceivablesTotalByPeriod(
        startDate,
        endDate,
      ),
    };
  }
}
