import { PaymentProvider } from './payment-provider';
import type { IPNProviderPort } from '../ports/payment-provider.port';

/**
 * Абстрактный класс для IPN провайдеров (Instant Payment Notification)
 * Реализует интерфейс IPNProviderPort из domain
 */
export abstract class IPNProvider extends PaymentProvider implements IPNProviderPort {
  public abstract handleIPN(request: any): Promise<void>;
}
