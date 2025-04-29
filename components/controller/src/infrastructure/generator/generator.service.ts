// infrastructure/generator/generator.service.ts
import { Injectable } from '@nestjs/common';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { GenerateDocumentDomainInterfaceWithOptions } from '~/domain/document/interfaces/generate-document-domain-with-options.interface';
import { generator } from '~/services/document.service';

@Injectable()
export class GeneratorInfrastructureService {
  async generateDocument(body: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    return new DocumentDomainEntity(await generator.generate(body.data, body.options));
  }
}
