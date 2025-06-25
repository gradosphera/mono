import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменный интерфейс для создания исходящего платежа
 */
export interface CreateOutgoingPaymentInputDomainInterface {
  coopname: string;
  username: string;
  quantity: string;
  symbol: string;
  method_id: string;
  memo?: string;
  statement: ISignedDocumentDomainInterface;
}
