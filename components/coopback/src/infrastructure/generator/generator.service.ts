// infrastructure/generator/generator.service.ts
import { Injectable } from '@nestjs/common';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { GenerateDocumentDomainInterface } from '~/domain/document/interfaces/generate-document-domain.interface';
import { generator } from '~/services/document.service';

@Injectable()
export class GeneratorInfrastructureService {
  async generateDocument(body: GenerateDocumentDomainInterface): Promise<DocumentDomainEntity> {
    return new DocumentDomainEntity(await generator.generate(body.data, body.options));
  }
}
