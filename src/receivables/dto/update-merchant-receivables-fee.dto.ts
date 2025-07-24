import {IsNumber} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateMerchantReceivablesFeeDto{
    @IsNumber()
    @ApiProperty({
        description: 'owner merchant of the receivable transaction',
    })
    merchantId: number;

    @IsNumber()
    @ApiProperty({
        description: 'fee percent to recalculate',
    })
    feePercent: number;
}