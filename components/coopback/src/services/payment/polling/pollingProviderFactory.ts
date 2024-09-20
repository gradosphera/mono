import SberbankPollingProvider from './sberbankPollingProvider';
import { PollingProvider } from './pollingProvider';

export class PollingProviderFactory {
  static createProvider(providerName: string): PollingProvider {
    switch (providerName) {
      case 'sberbank':
        return new SberbankPollingProvider();
      // Добавляем другие провайдеры для Polling
      default:
        throw new Error(`Провайдер Polling ${providerName} не поддерживается`);
    }
  }
}
