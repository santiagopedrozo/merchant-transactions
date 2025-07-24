import {IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive} from "class-validator";
import {Receivable, ReceivableStatus} from "../entities/receivable.entity";
import {plainToInstance} from "class-transformer";

export class UpdateReceivableDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsEnum(ReceivableStatus)
    status?: ReceivableStatus;

    @IsOptional()
    @IsDateString()
    scheduledPaymentDate?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    subtotal?: number;

    @IsOptional()
    @IsNumber()
    discount?: number;

    @IsOptional()
    @IsNumber()
    total?: number;

    static mapEntityToUpdateDto(entity: Receivable): UpdateReceivableDto {
        return plainToInstance(UpdateReceivableDto, {
            id: entity.id,
            status: entity.status,
            scheduledPaymentDate: entity.scheduledPaymentDate.toISOString(),
            subtotal: Number(entity.subtotal),
            discount: Number(entity.discount),
            total: Number(entity.total),
        });
    }
}