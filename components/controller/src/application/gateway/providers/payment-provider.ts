import { BaseExtModule } from '~/extensions/base.extension.module';
import type { PaymentDetails } from '~/types/order.types';
import type { PaymentProviderPort } from '~/domain/gateway/ports/payment-provider.port';

/**
 * Абстрактный базовый класс для платежных провайдеров
 * Наследуется от BaseExtModule и реализует интерфейс PaymentProviderPort из domain
 */
export abstract class PaymentProvider extends BaseExtModule implements PaymentProviderPort {
  public abstract tolerance_percent: number;
  public abstract fee_percent: number;
  public abstract createPayment(hash: string): Promise<PaymentDetails>;
}
