import type { PaymentDomainInterface } from './payment-domain.interface';
import { GatewayPaymentTypeEnum } from '../enums/gateway-payment-type.enum';

/**
 * Доменный интерфейс исходящего платежа
 * Расширяет универсальный интерфейс платежа
 */
export interface OutgoingPaymentDomainInterface extends Omit<PaymentDomainInterface, 'type'> {
  type: GatewayPaymentTypeEnum.OUTGOING;
}
