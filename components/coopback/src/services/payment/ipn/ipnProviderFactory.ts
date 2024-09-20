import YooKassaIPNProvider from './yooKassaIPNProvider';
import { IPNProvider } from './ipnProvider';

export class IPNProviderFactory {
  static createProvider(providerName: string): IPNProvider {
    switch (providerName) {
      case 'yookassa':
        return new YooKassaIPNProvider();
      // Добавляем другие провайдеры для IPN
      default:
        throw new Error(`Провайдер IPN ${providerName} не поддерживается`);
    }
  }
}
