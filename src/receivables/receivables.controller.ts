import {Body, Controller, Get, Param, ParseIntPipe, Post, Query} from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetReceivableDto } from './dto/get-receivable.dto';
import {UpdateMerchantReceivablesFeeDto} from "./dto/update-merchant-receivables-fee.dto";
import {BulkUpdateResponseDto} from "./dto/bulk-update-response.dto";

@ApiTags('Receivables')
@Controller('receivables')
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
    return receivables.map(GetReceivableDto.fromEntity);
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

  @Post('/recalculate-receivables')
  @ApiOperation({ summary: 'Recalculate receivables subtotal by merchant' })
  @ApiResponse({ status: 200, description: 'Receivables affected', type: BulkUpdateResponseDto })
  @ApiBody({
    type: UpdateMerchantReceivablesFeeDto,
  })
  async recalculateMerchantReceivableFee(
      @Body() dto: UpdateMerchantReceivablesFeeDto
  ): Promise<BulkUpdateResponseDto> {
    return this.receivablesService.findAndProcessPendingSubtotalFromMerchant(dto.merchantId, dto.feePercent)
  }

}
