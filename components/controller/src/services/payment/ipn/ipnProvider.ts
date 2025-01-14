import { PaymentProvider } from '../paymentProvider';

export abstract class IPNProvider extends PaymentProvider {
  public abstract handleIPN(request: any): Promise<void>;
}
