import type { PaymentDetails } from '../../types';

export abstract class PaymentProvider {
  public abstract tolerance_percent: number;
  public abstract fee_percent: number;
  public abstract createPayment(
    amount: string,
    symbol: string,
    description: string,
    order_num: number,
    secret: string
  ): Promise<PaymentDetails>;
}
