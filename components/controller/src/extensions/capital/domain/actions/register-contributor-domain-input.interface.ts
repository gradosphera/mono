import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
/**
 * Доменный интерфейс для действия регистрации вкладчика CAPITAL контракта
 */
export interface RegisterContributorDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Имя пользователя */
  username: string;

  /** О себе */
  about?: string;

  /** Ставка за час работы */
  rate_per_hour?: string;

  /** Документ договора УХД */
  contract: ISignedDocumentDomainInterface;
}
