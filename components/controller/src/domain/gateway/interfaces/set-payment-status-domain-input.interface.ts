import type { PaymentStatusEnum } from '../enums/payment-status.enum';

export interface SetPaymentStatusInputDomainInterface {
  id: string;
  status: PaymentStatusEnum;
}
