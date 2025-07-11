import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import { DocumentDomainEntity } from '../entity/document-domain.entity';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';

import {
  ExtendedSignedDocumentDomainInterface,
  SignatureInfoDomainInterface,
} from '../interfaces/extended-signed-document-domain.interface';
import type { ISignedDocumentDomainInterface } from '../interfaces/signed-document-domain.interface';
import { Classes } from '@coopenomics/sdk';
import {
  UserCertificateDomainService,
  USER_CERTIFICATE_DOMAIN_SERVICE,
} from '~/domain/user-certificate/services/user-certificate-domain.service';

@Injectable()
export class DocumentAggregator {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    @Inject(forwardRef(() => ACCOUNT_DOMAIN_SERVICE)) private readonly accountDomainService: AccountDomainService,
    @Inject(USER_CERTIFICATE_DOMAIN_SERVICE) private readonly userCertificateService: UserCertificateDomainService
  ) {}
  private readonly EMPTY_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Создает агрегатор документов на основе полного документа и подписанного документа
   * Автоматически извлекает подписанта на основе username из документа
   * @param signedDoc Подписанный документ (метаинформация) в новом формате
   * @returns Агрегатор документов
   */
  public async buildDocumentAggregate(signedDoc: ISignedDocumentDomainInterface): Promise<DocumentDomainAggregate | null> {
    // Получаем полный документ по хешу
    if (signedDoc.doc_hash === this.EMPTY_HASH) return null;

    const document = await this.getDocumentByHash(signedDoc.doc_hash);

    // Массив для хранения информации о подписантах
    const signatureInfos: SignatureInfoDomainInterface[] = [];

    // Если есть хотя бы одна подпись
    if (signedDoc.signatures && signedDoc.signatures.length > 0) {
      for (const signature of signedDoc.signatures) {
        // Получаем данные подписанта на основе signer из подписи
        const signer = await this.accountDomainService.getPrivateAccount(signature.signer);

        // Создаем сертификат подписанта из полной информации
        const signerCertificate = this.userCertificateService.createCertificateFromUserData(signer);

        // Формируем объект информации о подписи
        const signatureInfo: SignatureInfoDomainInterface = {
          id: signature.id,
          signed_hash: signature.signed_hash,
          signer: signature.signer,
          public_key: signature.public_key,
          signature: signature.signature,
          signed_at: signature.signed_at,
          is_valid: Classes.Document.validateSignature(signature),
          signer_certificate: signerCertificate,
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
