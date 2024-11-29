import type { IndividualDomainEntity } from '~/domain/branch/entities/individual-domain.entity';

export interface IndividualRepository {
  /**
   * Получить данные о физлице по имени аккаунта
   * @param username Имя аккаунта
   */
  findByUsername(username: string): Promise<IndividualDomainEntity>;
  create(data: IndividualDomainEntity);
}

export const INDIVIDUAL_REPOSITORY = Symbol('IndividualRepository'); // Создаем уникальный токен
