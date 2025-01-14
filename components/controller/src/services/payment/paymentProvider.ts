import { BaseExtModule } from '~/extensions/base.extension.module';
import type { PaymentDetails } from '../../types';

export abstract class PaymentProvider extends BaseExtModule {
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
