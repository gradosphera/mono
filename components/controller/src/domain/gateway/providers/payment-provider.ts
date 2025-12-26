import type { PaymentDetailsDomainInterface } from '../interfaces/payment-domain.interface';
import type { PaymentProviderPort } from '../ports/payment-provider.port';

/**
 * Абстрактный базовый класс для платежных провайдеров
 * Реализует интерфейс PaymentProviderPort из domain
 */
export abstract class PaymentProvider implements PaymentProviderPort {
  public abstract tolerance_percent: number;
  public abstract fee_percent: number;
  public abstract createPayment(hash: string): Promise<PaymentDetailsDomainInterface>;
}
