import type { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';

export interface OrganizationRepository {
  /**
   * Получить данные об организации по имени кооператива
   * @param username Имя кооператива
   */
  findByUsername(username: string): Promise<OrganizationDomainEntity>;
  create(data: OrganizationDomainEntity);
}

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository'); // Создаем уникальный токен
