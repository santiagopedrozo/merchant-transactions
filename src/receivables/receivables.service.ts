import {Injectable, Logger} from '@nestjs/common';
import {Receivable, ReceivableStatus} from './entities/receivable.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CreateReceivableDto} from './dto/create-receivable.dto';
import {UpdateReceivableDto} from "./dto/update-receivable.dto";
import {chunk} from 'lodash';
import {validate} from "class-validator";
import {BulkUpdateResponseDto} from "./dto/bulk-update-response.dto";
import { performance } from 'perf_hooks';
import {Utils} from "../shared/Utils";

@Injectable()
export class ReceivablesService {
    protected readonly logger = new Logger(ReceivablesService.name);

    constructor(
        @InjectRepository(Receivable)
        private readonly receivableRepository: Repository<Receivable>,
    ) {
    }

    async create(dto: CreateReceivableDto, manager?: EntityManager): Promise<Receivable> {
        const repo = manager?.getRepository(Receivable) ?? this.receivableRepository;

        const receivable = new Receivable();

        receivable.status = dto.status;
        receivable.scheduledPaymentDate = new Date(dto.scheduledPaymentDate);
        receivable.subtotal = dto.subtotal;
        receivable.discount = dto.discount;
        receivable.total = dto.total;
        receivable.transactionId = dto.transactionId;

        return repo.save(receivable);
    }

    async getReceivablesByMerchant(merchantId: number): Promise<Receivable[]> {
        return this.receivableRepository
            .createQueryBuilder('receivable')
            .innerJoin('receivable.transaction', 'transaction')
            .innerJoin('transaction.merchant', 'merchant')
            .where('merchant.id = :merchantId', {merchantId})
            .getMany();
    }

    async getReceivablesTotalByPeriod(
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        const start = new Date(
            Date.UTC(
                startDate.getUTCFullYear(),
                startDate.getUTCMonth(),
                startDate.getUTCDate(),
                0,
                0,
                0,
                0,
            ),
        );

        const end = new Date(
            Date.UTC(
                endDate.getUTCFullYear(),
                endDate.getUTCMonth(),
                endDate.getUTCDate(),
                23,
                59,
                59,
                999,
            ),
        );

        const result = await this.receivableRepository
            .createQueryBuilder('receivable')
            .select('SUM(receivable.total)', 'total')
            .where('receivable.scheduledPaymentDate BETWEEN :start AND :end', {
                start,
                end,
            })
            .getRawOne();

        return parseFloat(result.total) || 0;
    }

    async bulkUpdate(updateDtos: UpdateReceivableDto[], chunkSize: number = 100): Promise<BulkUpdateResponseDto> {
        const chunks: UpdateReceivableDto[][] = chunk(updateDtos, chunkSize);

        let totalUpdated = 0;
        let totalFailed = 0;

        for (const chunk of chunks) {
            const start = performance.now();

            const queryRunner = this.receivableRepository.manager.connection.createQueryRunner();

            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const chunkResults = await Promise.all(
                    chunk.map(async (updateDto: UpdateReceivableDto) => {
                        try {
                            /*
                            const errors = await validate(updateDto);
                            if (errors.length > 0) {
                                throw new Error(`Invalid DTO: ${JSON.stringify(errors)}`);
                            }

                             */

                            const updateData: Partial<UpdateReceivableDto> = Utils.cleanDto(updateDto);

                            const result = await queryRunner.manager.update(
                                Receivable,
                                updateDto.id,
                                updateData
                            );

                            if (result.affected === 0) {
                                throw new Error(`Receivable with id ${updateDto.id} not found`);
                            }

                            return 'updated';
                        } catch (e) {
                            this.logger.error(e, `failed updating receivable ${updateDto.id}`);
                            return 'failed';
                        }
                    })
                );

                await queryRunner.commitTransaction();

                const updatedInChunk = chunkResults.filter(r => r === 'updated').length;
                const failedInChunk = chunkResults.filter(r => r === 'failed').length;

                totalUpdated += updatedInChunk;
                totalFailed += failedInChunk;

                const end = performance.now();
                this.logger.log(`Processed chunk of ${chunk.length} in ${(end - start).toFixed(2)} ms`);
            } catch (e) {
                await queryRunner.rollbackTransaction();
                this.logger.error(e, `Transaction failed. Rolled back chunk of ${chunk.length}`);
                totalFailed += chunk.length;
            } finally {
                await queryRunner.release();
            }
        }

        return {
            updated: totalUpdated,
            failed: totalFailed,
            proccesed: updateDtos.length,
        };
    }

    async findAndProcessPendingSubtotalFromMerchant(merchantId: number, feePercent: number): Promise<BulkUpdateResponseDto> {
        try {
            const start = performance.now();

            const foundResults: Receivable[] = await
                this.receivableRepository
                    .createQueryBuilder('r')
                    .innerJoin('r.transaction', 'transaction')
                    .innerJoin('transaction.merchant', 'merchant')
                    .where('r.status = :status', {status: ReceivableStatus.WAITING_FUNDS})
                    .andWhere('merchant.id = :merchantId', {merchantId})
                    .getMany()

            const end = performance.now();

            this.logger.log(`found ${foundResults.length} receivables to update by merchantId ${merchantId} on ${(end - start).toFixed(2)} ms`)
            foundResults.map(value => value.subtotal * feePercent)

            const updateDtos: UpdateReceivableDto[] = foundResults.map(value => UpdateReceivableDto.mapEntityToUpdateDto(value))

            return this.bulkUpdate(updateDtos)
        } catch
            (e) {
            throw e
        }
    }
}
