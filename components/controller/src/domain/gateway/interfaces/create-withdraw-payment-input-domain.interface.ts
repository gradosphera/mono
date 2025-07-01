import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для создания исходящего платежа (withdraw)
 */
export interface CreateWithdrawPaymentInputDomainInterface {
  coopname: string;
  username: string;
  quantity: number;
  symbol: string;
  method_id: string;
  statement: ISignedDocumentDomainInterface;
  payment_hash: string; // Хеш платежа для связи с withdraw
}
