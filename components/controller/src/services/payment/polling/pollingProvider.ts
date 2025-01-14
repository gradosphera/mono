import { PaymentProvider } from '../paymentProvider';

export abstract class PollingProvider extends PaymentProvider {
  public abstract sync(): Promise<void>;
}
