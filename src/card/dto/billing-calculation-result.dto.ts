import { ReceivableStatus } from '../../receivables/entities/receivable.entity';

export class BillingCalculationResultDto {
  status: ReceivableStatus;
  paymentDate: Date;
  feeAmount: number;
  total: number;
}
