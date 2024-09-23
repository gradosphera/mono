import type { PaymentProvider } from '../paymentProvider';

export interface PollingProvider extends PaymentProvider {
  sync(): Promise<void>;
}
