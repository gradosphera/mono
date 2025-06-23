import type { Queries } from '@coopenomics/sdk';

/**
 * Результат поиска пользователя из SDK
 */
export type UserSearchResult =
  Queries.Accounts.SearchPrivateAccounts.IOutput['searchPrivateAccounts'][0];

/**
 * Данные пользователя для отображения
 */
export interface UserDisplayData {
  username: string;
  displayName: string;
  type: 'individual' | 'entrepreneur' | 'organization';
  additionalInfo?: string;
}
