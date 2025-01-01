import type { PaymentStatus } from './payment-status-domain.interface';

export interface SetPaymentStatusInputDomainInterface {
  id: string;
  status: PaymentStatus;
}
