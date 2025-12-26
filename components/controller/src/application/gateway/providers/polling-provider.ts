import { PaymentProvider } from './payment-provider';
import type { PollingProviderPort } from '~/domain/gateway/ports/payment-provider.port';

/**
 * Абстрактный класс для Polling провайдеров (проверка статуса через опрос)
 * Наследуется от PaymentProvider и реализует интерфейс PollingProviderPort из domain
 */
export abstract class PollingProvider extends PaymentProvider implements PollingProviderPort {
  public abstract sync(): Promise<void>;
}
