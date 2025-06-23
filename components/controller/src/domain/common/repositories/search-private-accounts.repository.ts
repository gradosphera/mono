import type {
  SearchPrivateAccountsInputDomainInterface,
  PrivateAccountSearchResultDomainInterface,
} from '../interfaces/search-private-accounts-domain.interface';

/**
 * Доменный репозиторий для поиска приватных аккаунтов
 */
export interface SearchPrivateAccountsRepository {
  /**
   * Поиск приватных аккаунтов по запросу
   * @param input Входные данные для поиска
   * @returns Массив результатов поиска
   */
  searchPrivateAccounts(
    input: SearchPrivateAccountsInputDomainInterface
  ): Promise<PrivateAccountSearchResultDomainInterface[]>;
}

export const SEARCH_PRIVATE_ACCOUNTS_REPOSITORY = Symbol('SearchPrivateAccountsRepository');
