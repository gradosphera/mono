// infrastructure/repositories/organization.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { DocumentRepository } from '~/domain/document/repository/document.repository';
import { GENERATOR_PORT, GeneratorPort } from '~/domain/document/ports/generator.port';

@Injectable()
export class DocumentRepositoryImplementation implements DocumentRepository {
  constructor(@Inject(GENERATOR_PORT) private readonly generatorPort: GeneratorPort) {}

  async findByHash(hash: string | null): Promise<DocumentDomainEntity | null> {
    // Используем генератор для извлечения данных из базы
    if (hash) {
      const document = await this.generatorPort.getDocument({ hash: hash.toUpperCase() });
      if (document) return new DocumentDomainEntity(document);
      return null;
    }
    return null;
  }
}
