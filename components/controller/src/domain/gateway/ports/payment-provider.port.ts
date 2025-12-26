import type { PaymentDetails } from '~/types/order.types';

/**
 * Порт для платежных провайдеров
 * Определяет интерфейс взаимодействия с платежными провайдерами
 */
export interface PaymentProviderPort {
  /** Процент толерантности к сумме платежа */
  tolerance_percent: number;

  /** Процент комиссии */
  fee_percent: number;

  /** Создание платежа по хэшу */
  createPayment(hash: string): Promise<PaymentDetails>;
}

/**
 * Порт для IPN провайдеров (Instant Payment Notification)
 */
export interface IPNProviderPort extends PaymentProviderPort {
  /** Обработка IPN уведомления */
  handleIPN(request: any): Promise<void>;
}

/**
 * Порт для Polling провайдеров (проверка статуса платежа через опрос)
 */
export interface PollingProviderPort extends PaymentProviderPort {
  /** Синхронизация платежей */
  sync(): Promise<void>;
}

export const PAYMENT_PROVIDER_PORT = Symbol('PAYMENT_PROVIDER_PORT');
export const IPN_PROVIDER_PORT = Symbol('IPN_PROVIDER_PORT');
export const POLLING_PROVIDER_PORT = Symbol('POLLING_PROVIDER_PORT');
