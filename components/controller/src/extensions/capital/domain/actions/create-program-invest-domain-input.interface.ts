import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/** Доменный ввод для действия createpinv (программная денежная инвестиция) */
export interface CreateProgramInvestDomainInput {
  coopname: string;
  username: string;
  invest_hash: string;
  amount: string;
  statement: ISignedDocumentDomainInterface;
}
