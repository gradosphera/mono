import type { PaymentDetails } from '../../types';

export interface PaymentProvider {
  tolerance_percent: number;
  fee_percent: number;
  createPayment(amount: string, description: string, secret: string): Promise<PaymentDetails>;
}
