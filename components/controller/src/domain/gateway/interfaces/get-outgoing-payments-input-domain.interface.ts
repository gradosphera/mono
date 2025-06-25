/**
 * Доменный интерфейс для получения исходящих платежей
 */
export interface GetOutgoingPaymentsInputDomainInterface {
  coopname?: string;
  username?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}
