import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import { DocumentDomainEntity } from '../entity/document-domain.entity';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';
import {
  ExtendedSignedDocumentDomainInterface,
  SignatureInfoDomainInterface,
} from '../interfaces/extended-signed-document-domain.interface';
import type { ISignedDocumentDomainInterface } from '../interfaces/signed-document-domain.interface';
import { Classes } from '@coopenomics/sdk';
@Injectable()
export class DocumentAggregator {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Создает агрегатор документов на основе полного документа и подписанного документа
   * Автоматически извлекает подписанта на основе username из документа
   * @param signedDoc Подписанный документ (метаинформация) в новом формате
   * @returns Агрегатор документов
   */
  public async buildDocumentAggregate(signedDoc: ISignedDocumentDomainInterface): Promise<DocumentDomainAggregate | null> {
    // Получаем полный документ по хешу
    const document = await this.getDocumentByHash(signedDoc.doc_hash);

    // Проверяем, что в метаданных документа есть username
    if (!signedDoc.meta || !signedDoc.meta.username) {
      throw new BadRequestException('В документе отсутствует информация о пользователе (username)');
    }

    // Массив для хранения информации о подписантах
    const signatureInfos: SignatureInfoDomainInterface[] = [];

    // Если есть хотя бы одна подпись
    if (signedDoc.signatures && signedDoc.signatures.length > 0) {
      for (const signature of signedDoc.signatures) {
        // Получаем данные подписанта на основе signer из подписи
        const signer = await this.accountDomainService.getPrivateAccount(signature.signer);

        // Формируем объект информации о подписи
        const signatureInfo: SignatureInfoDomainInterface = {
          id: signature.id,
          signed_hash: signature.signed_hash,
          signer: signature.signer,
          public_key: signature.public_key,
          signature: signature.signature,
          signed_at: signature.signed_at,
          is_valid: Classes.Document.validateSignature(signature),
          signer_info: signer,
          meta: signature.meta,
        };

        signatureInfos.push(signatureInfo);
      }
    }

    // Формируем документ в соответствии с интерфейсом ExtendedSignedDocumentDomainInterface
    const extendedDoc: ExtendedSignedDocumentDomainInterface = {
      version: signedDoc.version,
      hash: signedDoc.hash,
      doc_hash: signedDoc.doc_hash,
      meta_hash: signedDoc.meta_hash,
      meta: signedDoc.meta,
      signatures: signatureInfos,
    };
    if (!document) return null;

    return new DocumentDomainAggregate(signedDoc.hash, extendedDoc, document);
  }

  /**
   * Получает документ по хешу
   * @param hash Хеш документа
   * @returns Документ
   */
  private async getDocumentByHash(hash: string): Promise<DocumentDomainEntity | null> {
    const document = await this.documentRepository.findByHash(hash);
    return document;
  }
}
