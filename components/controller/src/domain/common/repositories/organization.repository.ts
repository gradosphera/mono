import type { OrganizationDomainInterface } from '../interfaces/organization-domain.interface';

export interface OrganizationRepository {
  /**
   * Получить данные об организации по имени кооператива
   * @param username Имя кооператива
   */
  findByUsername(username: string): Promise<OrganizationDomainInterface>;
  create(data: OrganizationDomainInterface): Promise<void>;
}

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository'); // Создаем уникальный токен
