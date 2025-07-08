import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../secrets/guards/auth-token.guard';

@ApiTags('merchant')
@Controller('merchant')
@ApiSecurity('auth_token')
@UseGuards(AuthTokenGuard)
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
  async create(@Body() merchantName: string): Promise<number> {
    const created = await this.merchantService.create(merchantName);
    return created.id;
  }
}
