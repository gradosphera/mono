import type { IndividualDomainInterface } from './individual-domain.interface';
import type { EntrepreneurDomainInterface } from './entrepreneur-domain.interface';
import type { OrganizationDomainInterface } from './organization-domain.interface';

/**
 * Интерфейс для входных данных поиска приватных аккаунтов
 */
export interface SearchPrivateAccountsInputDomainInterface {
  query: string;
}

/**
 * Тип данных результата поиска - union type всех возможных типов приватных данных
 */
export type PrivateAccountSearchDataDomainInterface =
  | IndividualDomainInterface
  | EntrepreneurDomainInterface
  | OrganizationDomainInterface;

/**
 * Интерфейс результата поиска приватных аккаунтов
 */
export interface PrivateAccountSearchResultDomainInterface {
  type: 'individual' | 'entrepreneur' | 'organization';
  data: PrivateAccountSearchDataDomainInterface;
  score?: number;
  highlightedFields?: string[];
}
