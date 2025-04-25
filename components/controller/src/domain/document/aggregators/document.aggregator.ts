import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import { DocumentDomainEntity } from '../entity/document-domain.entity';
import { Cooperative } from 'cooptypes';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';
import { SignedDocumentDomainEntity } from '../entity/signed-document-domain.entity';

@Injectable()
export class DocumentAggregator {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Создает агрегатор документов на основе полного документа и подписанного документа
   * Автоматически извлекает подписанта на основе username из документа
   * @param signedDoc Подписанный документ (метаинформация)
   * @returns Агрегатор документов
   */
  public async buildDocumentAggregate<T extends DocumentMetaDomainInterface>(
    signedDoc: Cooperative.Document.ISignedDocument<T>
  ): Promise<DocumentDomainAggregate> {
    // Получаем полный документ по хешу
    const document = await this.getDocumentByHash(signedDoc.hash);

    // Проверяем, что в метаданных документа есть username
    if (!signedDoc.meta || !signedDoc.meta.username) {
      throw new BadRequestException('В документе отсутствует информация о пользователе (username)');
    }

    // Получаем данные подписанта на основе username из документа
    const signer = await this.accountDomainService.getPrivateAccount(signedDoc.meta.username);

    // Формируем объект подписи
    const signature = new SignedDocumentDomainEntity({
      ...signedDoc,
      signer,
      hash: signedDoc.hash,
      public_key: signedDoc.public_key,
      signature: signedDoc.signature,
      meta: signedDoc.meta,
    });

    const signatures = [signature];
    return new DocumentDomainAggregate(signedDoc.hash, document, signatures);
  }

  /**
   * Получает документ по хешу
   * @param hash Хеш документа
   * @returns Документ
   */
  private async getDocumentByHash(hash: string): Promise<DocumentDomainEntity> {
    const document = await this.documentRepository.findByHash(hash);
    if (!document) throw new BadRequestException('Документ не найден');
    return document;
  }
}
