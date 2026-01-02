import type { PaymentMethodDomainEntity } from '../entities/method-domain.entity';

/**
 * Доменный порт для операций с методами оплаты
 * Используется для получения дефолтного метода оплаты
 */
export interface PaymentMethodDomainPort {
  /**
   * Получить дефолтный метод оплаты для пользователя
   * @param username имя пользователя
   */
  getDefaultPaymentMethod(username: string): Promise<PaymentMethodDomainEntity | null>;
}

export const PAYMENT_METHOD_DOMAIN_PORT = Symbol('PaymentMethodDomainPort');
