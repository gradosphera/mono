import type { PaymentProvider } from '../paymentProvider';

export interface IPNProvider extends PaymentProvider {
  handleIPN(request: any): Promise<void>;
}
