import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
/**
 * Доменный интерфейс для действия регистрации вкладчика CAPITAL контракта
 */
export interface RegisterContributorDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Имя пользователя */
  username: string;

  /** Хэш вкладчика */
  contributor_hash: string;

  /** Ставка за час работы */
  rate_per_hour: string;

  /** Флаг внешнего контракта */
  is_external_contract: boolean;

  /** Документ договора УХД */
  contract: ISignedDocumentDomainInterface;
}
