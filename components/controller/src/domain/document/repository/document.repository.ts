import type { DocumentDomainEntity } from '../entity/document-domain.entity';

export interface DocumentRepository {
  /**
   * Получить данные об организации по имени кооператива
   * @param hash Имя кооператива
   */
  findByHash(hash: string): Promise<DocumentDomainEntity | null>;
}

export const DOCUMENT_REPOSITORY = Symbol('DocumentRepository'); // Создаем уникальный токен
