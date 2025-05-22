// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { DocumentRepository } from '~/domain/document/repository/document.repository';
import { generator } from '~/services/document.service';

@Injectable()
export class DocumentRepositoryImplementation implements DocumentRepository {
  async findByHash(hash: string | null): Promise<DocumentDomainEntity | null> {
    // Используем генератор для извлечения данных из базы
    if (hash) {
      const document = await generator.getDocument({ hash: hash.toUpperCase() });
      if (document) return new DocumentDomainEntity(document);
      return null;
    }
    return null;
  }
}
