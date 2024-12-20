import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import type { GenerateDocumentDomainInterface } from '../interfaces/generate-document-domain.interface';
import { DocumentDomainEntity } from '../entity/document-domain.entity';

@Injectable()
export class DocumentDomainService {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    private readonly generatorInfrastructureService: GeneratorInfrastructureService
  ) {}

  public async generateDocument(data: GenerateDocumentDomainInterface): Promise<DocumentDomainEntity> {
    return await this.generatorInfrastructureService.generateDocument(data);
  }

  public async getDocumentByHash(hash: string): Promise<DocumentDomainEntity> {
    const document = await this.documentRepository.findByHash(hash);
    if (!document) throw new BadRequestException('Документ не найден');
    return document;
  }
}
