export interface OrganizationRepository {
  /**
   * Получить данные об организации по имени кооператива
   * @param coopname Имя кооператива
   */
  findByUsername(coopname: string): Promise<any>;
}

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository'); // Создаем уникальный токен
