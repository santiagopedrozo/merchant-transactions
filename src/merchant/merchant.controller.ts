import { Body, Controller, Post } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {CreateMerchantDto} from "../dto/create-merchant.dto";

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiBody({
    schema: {
      type: 'string',
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Returns the ID of the newly created merchant',
  })
  async create(@Body() dto: CreateMerchantDto): Promise<number> {
    const created = await this.merchantService.create(dto.merchantName);
    return created.id;
  }
}
