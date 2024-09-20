import type { PaymentProvider } from '../paymentProvider';

export interface PollingProvider extends PaymentProvider {
  checkPaymentStatus(orderId: string): Promise<string>;
  sync(): Promise<void>;
}
