// domain/payments/interfaces/payment-method-repository.interface.ts
import type { ListPaymentMethodsDomainInterface } from '~/domain/payment-method/interfaces/list-payment-methods-input.interface';
import { PaymentMethodDomainEntity } from '../../payment-method/entities/method-domain.entity';
import type { PaginationResultDomainInterface } from '../interfaces/pagination.interface';
import type { GetPaymentMethodDomainInterface } from '~/domain/payment-method/interfaces/get-payment-method-domain.interface';

export interface PaymentMethodRepository {
  /**
   * Сохранить метод оплаты.
   * @param data - Данные метода оплаты.
   * @returns Сохраненный метод оплаты.
   */
  save(data: PaymentMethodDomainEntity): Promise<PaymentMethodDomainEntity>;

  /**
   * Удалить метод оплаты.
   * @param filter - Фильтр для удаления метода оплаты.
   */
  delete(username: string, method_id: string): Promise<void>;

  /**
   * Получить список методов оплаты.
   * @param filter - Фильтр для поиска методов оплаты.
   * @returns Список методов оплаты.
   */
  list(data?: ListPaymentMethodsDomainInterface): Promise<PaginationResultDomainInterface<PaymentMethodDomainEntity>>;

  get(data: GetPaymentMethodDomainInterface): Promise<PaymentMethodDomainEntity>;
}

export const PAYMENT_METHOD_REPOSITORY = Symbol('PaymentMethodRepository');
