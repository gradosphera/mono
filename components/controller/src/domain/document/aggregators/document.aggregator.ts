import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import { DocumentDomainEntity } from '../entity/document-domain.entity';
import { Cooperative } from 'cooptypes';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';
import { SignedDocumentDomainEntity } from '../entity/signed-document-domain.entity';
import {
  ExtendedSignedDocument2DomainInterface,
  SignatureInfoDomainInterface,
} from '../interfaces/signed-document-domain.interface';

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
  public async buildDocumentAggregate<T extends DocumentMetaDomainInterface>(
    signedDoc: Cooperative.Document.ISignedDocument2<T>
  ): Promise<DocumentDomainAggregate> {
    // Получаем полный документ по хешу
    const document = await this.getDocumentByHash(signedDoc.hash);

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
          signer: signature.signer,
          public_key: signature.public_key,
          signature: signature.signature,
          signed_at: new Date(signature.signed_at),
          is_valid: true, // Предполагаем, что подпись валидна
          signer_info: signer,
        };

        signatureInfos.push(signatureInfo);
      }
    }

    // Формируем документ в соответствии с интерфейсом ExtendedSignedDocument2DomainInterface
    const extendedDoc: ExtendedSignedDocument2DomainInterface = {
      version: signedDoc.version,
      hash: signedDoc.hash,
      doc_hash: signedDoc.doc_hash,
      meta_hash: signedDoc.meta_hash,
      meta: signedDoc.meta,
      signatures: signatureInfos,
    };

    return new DocumentDomainAggregate(signedDoc.hash, extendedDoc, document);
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
