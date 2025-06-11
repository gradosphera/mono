import type { IndividualDomainInterface } from '../interfaces/individual-domain.interface';

export interface IndividualRepository {
  /**
   * Получить данные о физлице по имени аккаунта
   * @param username Имя аккаунта
   */
  findByUsername(username: string): Promise<IndividualDomainInterface>;
  create(data: IndividualDomainInterface): Promise<void>;
}

export const INDIVIDUAL_REPOSITORY = Symbol('IndividualRepository'); // Создаем уникальный токен
