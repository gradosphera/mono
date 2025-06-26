import type { PaymentStatusEnum } from '../enums/payment-status.enum';
import type { PaymentTypeEnum, PaymentDirectionEnum } from '../enums/payment-type.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Детали платежа
 */
export interface PaymentDetailsDomainInterface {
  /** Строка с данными платежа (QR-код, токен, реквизиты и т.д.) */
  data: any;
  /** Сумма платежа с учетом комиссии */
  amount_plus_fee: string;
  /** Сумма платежа без учета комиссии */
  amount_without_fee: string;
  /** Размер комиссии в абсолютных значениях */
  fee_amount: string;
  /** Процент комиссии */
  fee_percent: number;
  /** Фактический процент комиссии */
  fact_fee_percent: number;
  /** Допустимый процент отклонения */
  tolerance_percent: number;
}

/**
 * Унифицированный доменный интерфейс платежа
 * Подходит для всех типов платежей (входящих и исходящих)
 */
export interface PaymentDomainInterface {
  /** Уникальный идентификатор платежа */
  id?: string;

  /** Хеш платежа для идентификации в блокчейне */
  hash: string;

  /** Название кооператива */
  coopname: string;

  /** Имя пользователя */
  username: string;

  /** Количество/сумма платежа */
  quantity: number;

  /** Символ валюты */
  symbol: string;

  /** Тип платежа (назначение) */
  type: PaymentTypeEnum;

  /** Направление платежа (входящий/исходящий) */
  direction: PaymentDirectionEnum;

  /** Статус платежа */
  status: PaymentStatusEnum;

  /** Провайдер платежа */
  provider?: string;

  /** ID платежного метода */
  payment_method_id?: string;

  /** Секрет для авторизации платежа */
  secret?: string;

  /** Сообщение об ошибке или дополнительная информация */
  message?: string;

  /** Дополнительная информация */
  memo?: string;

  /** Дата истечения платежа */
  expired_at?: Date;

  /** Дата создания */
  created_at: Date;

  /** Дата последнего обновления */
  updated_at?: Date;

  /** Детали платежа */
  payment_details?: PaymentDetailsDomainInterface;

  /** Данные из блокчейна */
  blockchain_data?: any;

  /** Подписанный документ заявления (для исходящих платежей) */
  statement?: ISignedDocumentDomainInterface;
}
