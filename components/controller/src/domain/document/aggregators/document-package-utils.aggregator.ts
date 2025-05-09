import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { Inject } from '@nestjs/common';

@Injectable()
export class DocumentPackageUtils {
  constructor(@Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository) {}

  /**
   * Получает документ по хешу
   * @param hash Хеш документа
   * @returns Документ или null, если не найден
   */
  async getDocumentByHash(hash: string): Promise<DocumentDomainEntity | null> {
    const document = await this.documentRepository.findByHash(hash);
    return document;
  }

  /**
   * Создает хеш метаданных документа
   * @param meta Метаданные документа
   * @returns SHA-256 хеш метаданных в hex-формате
   */
  createMetaHash(meta: any): string {
    const metaStr = JSON.stringify(meta);
    const hash = crypto.createHash('sha256').update(metaStr).digest('hex');
    return hash;
  }
}
