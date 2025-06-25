import { GatewayPaymentStatusEnum } from '../enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '../enums/gateway-payment-type.enum';

/**
 * Доменный интерфейс для обновления статуса платежа
 */
export interface UpdatePaymentStatusInputDomainInterface {
  hash: string; // Универсальный хеш (income_hash или outcome_hash)
  coopname: string;
  type?: GatewayPaymentTypeEnum; // Тип платежа
  status: GatewayPaymentStatusEnum; // Любой статус из enum
  reason?: string; // для статуса failed
}
