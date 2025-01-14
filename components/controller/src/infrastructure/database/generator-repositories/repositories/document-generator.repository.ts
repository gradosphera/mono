// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { DocumentRepository } from '~/domain/document/repository/document.repository';
import { generator } from '~/services/document.service';

@Injectable()
export class DocumentRepositoryImplementation implements DocumentRepository {
  async findByHash(hash: string): Promise<DocumentDomainEntity> {
    // Используем генератор для извлечения данных из базы
    const document = await generator.getDocument({ hash });
    return new DocumentDomainEntity(document);
  }
}
