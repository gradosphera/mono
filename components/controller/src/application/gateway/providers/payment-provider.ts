import { BaseExtModule } from '~/extensions/base.extension.module';
import type { PaymentDetailsDomainInterface } from '~/domain/gateway/interfaces/payment-domain.interface';
import type { PaymentProviderPort } from '~/domain/gateway/ports/payment-provider.port';

/**
 * Абстрактный базовый класс для платежных провайдеров
 * Наследуется от BaseExtModule и реализует интерфейс PaymentProviderPort из domain
 */
export abstract class PaymentProvider extends BaseExtModule implements PaymentProviderPort {
  public abstract tolerance_percent: number;
  public abstract fee_percent: number;
  public abstract createPayment(hash: string): Promise<PaymentDetailsDomainInterface>;
}
