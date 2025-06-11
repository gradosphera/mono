import type { EntrepreneurDomainInterface } from '../interfaces/entrepreneur-domain.interface';

export interface EntrepreneurRepository {
  /**
   * Получить данные об ИП по имени аккаунта
   * @param username Имя аккаунта
   */
  findByUsername(username: string): Promise<EntrepreneurDomainInterface>;
  create(data: EntrepreneurDomainInterface): Promise<void>;
}

export const ENTREPRENEUR_REPOSITORY = Symbol('EntrepreneurRepository'); // Создаем уникальный токен
