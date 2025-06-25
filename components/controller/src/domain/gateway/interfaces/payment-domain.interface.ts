import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import { GatewayPaymentStatusEnum } from '../enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '../enums/gateway-payment-type.enum';

/**
 * Универсальный доменный интерфейс платежа
 * Работает как для входящих, так и для исходящих платежей
 */
export interface PaymentDomainInterface {
  id?: string;
  coopname: string;
  username: string;
  hash: string; // Универсальный хеш (income_hash или outcome_hash)
  quantity: string;
  symbol: string;
  method_id: string;
  status: GatewayPaymentStatusEnum;
  type: GatewayPaymentTypeEnum;
  created_at: Date;
  updated_at?: Date;
  memo?: string;
  payment_details?: string;
  blockchain_data?: any;
  statement?: ISignedDocumentDomainInterface;
}
