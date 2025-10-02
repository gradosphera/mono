// infrastructure/generator/generator.service.ts
import { Injectable } from '@nestjs/common';
import httpStatus from 'http-status';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { GenerateDocumentDomainInterfaceWithOptions } from '~/domain/document/interfaces/generate-document-domain-with-options.interface';
import { HttpApiError } from '~/errors/http-api-error';
import { generator } from '~/services/document.service';

@Injectable()
export class GeneratorInfrastructureService {
  async generateDocument(body: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    try {
      return new DocumentDomainEntity(await generator.generate(body.data, body.options));
    } catch (error) {
      console.error('Ошибка при генерации документа:', error);
      throw new HttpApiError(httpStatus.BAD_REQUEST, 'Ошибка при генерации документа');
    }
  }
}
