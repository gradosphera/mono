import type { userStatus } from '~/types/user.types';

/**
 * Интерфейс входных данных для создания пользователя
 */
export interface CreateUserInputDomainInterface {
  username: string;
  status?: userStatus;
  message?: string;
  is_registered?: boolean;
  has_account?: boolean;
  type: 'individual' | 'entrepreneur' | 'organization';
  public_key?: string;
  referer?: string;
  email: string;
  role?: string;
  is_email_verified?: boolean;
  subscriber_id?: string;
  subscriber_hash?: string;
}
