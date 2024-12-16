import { Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import type { GenerateDocumentDomainInterface } from '../interfaces/generate-document-domain.interface';
import { DocumentDomainService } from '../services/document-domain.service';
import type { DocumentDomainEntity } from '../entity/document-domain.entity';

@Injectable()
export class DocumentInteractor {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    private readonly documentDomainService: DocumentDomainService
  ) {}

  public async generateDocument(data: GenerateDocumentDomainInterface): Promise<DocumentDomainEntity> {
    return await this.documentDomainService.generateDocument(data);
  }
}
