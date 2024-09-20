import { PaymentProvider } from './paymentProvider';

import YooKassaIPNProvider from './ipn/yooKassaIPNProvider';
import SberbankProvider from './polling/sberbankPollingProvider';

export class ProviderFactory {
  static createProvider(providerName: string): PaymentProvider {
    switch (providerName) {
      case 'yookassa':
        return new YooKassaIPNProvider(); // Поддерживает IPN
      case 'sberbank':
        return new SberbankProvider(); // Поддерживает Polling
      default:
        throw new Error(`Провайдер ${providerName} не поддерживается`);
    }
  }
}
