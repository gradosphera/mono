import { EntrepreneurDomainEntity } from '~/domain/branch/entities/entrepreneur-domain.entity';

export interface EntrepreneurRepository {
  /**
   * Получить данные об ИП по имени аккаунта
   * @param username Имя аккаунта
   */
  findByUsername(username: string): Promise<EntrepreneurDomainEntity>;
  create(data: EntrepreneurDomainEntity);
}

export const ENTREPRENEUR_REPOSITORY = Symbol('EntrepreneurRepository'); // Создаем уникальный токен
