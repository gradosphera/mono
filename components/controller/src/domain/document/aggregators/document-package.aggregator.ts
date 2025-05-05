import { Injectable, Inject } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import { DocumentAggregator } from './document.aggregator';
import type { DocumentPackageAggregateDomainInterface } from '../interfaces/document-package-aggregate-domain.interface';
import type { StatementDetailAggregateDomainInterface } from '../interfaces/statement-detail-aggregate-domain.interface';
import type { DecisionDetailAggregateDomainInterface } from '../interfaces/decision-detail-aggregate-domain.interface';
import type { ActDetailAggregateDomainInterface } from '../interfaces/act-detail-aggregate-domain.interface';
import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import { Cooperative, SovietContract } from 'cooptypes';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { getActions } from '~/utils/getFetch';
import * as crypto from 'crypto';

@Injectable()
export class DocumentPackageAggregator {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    private readonly documentAggregator: DocumentAggregator,
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Создает агрегат пакета документов из блокчейн-действия
   * Заменяет старую функцию buildDocumentPackage в DocumentDomainService
   * @param rawAction Блокчейн-действие
   * @returns Агрегат пакета документов
   */
  async buildDocumentPackageAggregate(
    rawAction: Cooperative.Blockchain.IAction
  ): Promise<DocumentPackageAggregateDomainInterface> {
    // Инициализация частей будущего DocumentPackageAggregate

    let statementDetail: StatementDetailAggregateDomainInterface | null = null;
    let decisionDetail: DecisionDetailAggregateDomainInterface | null = null;
    const actDetails: ActDetailAggregateDomainInterface[] = [];
    const links: DocumentDomainAggregate[] = [];

    // Определяем версию документа
    const docVersion =
      rawAction.data &&
      'document' in rawAction.data &&
      typeof rawAction.data.document === 'object' &&
      'version' in rawAction.data.document
        ? String((rawAction.data.document as { version?: string }).version)
        : '0';

    if (docVersion === '0') {
      // --- СТАРЫЙ ФОРМАТ (INewSubmitted) ---
      interface legacyNewSubmitted {
        coopname: string;
        username: string;
        action: string;
        decision_id: number;
        document: Cooperative.Document.IChainDocument;
      }
      const rawData: legacyNewSubmitted = rawAction.data;
      // -----------------------------------------------------
      // ШАГ 1: Подготовка ЗАЯВЛЕНИЯ (Statement)
      // -----------------------------------------------------
      {
        const mainDocument = await this.getDocumentByHash(rawData.document.hash);
        if (mainDocument?.meta?.links && Array.isArray(mainDocument.meta.links)) {
          for (const linkHash of mainDocument.meta.links) {
            const linkedDoc = await this.getDocumentByHash(linkHash);
            if (linkedDoc) {
              const signedLinkedDoc: Cooperative.Document.ISignedDocument2 = {
                version: '1.0',
                hash: linkedDoc.hash,
                doc_hash: linkedDoc.hash,
                meta_hash: this.createMetaHash(linkedDoc.meta),
                meta: linkedDoc.meta,
                signatures: [],
              };
              const linkAggregate = await this.documentAggregator.buildDocumentAggregate(signedLinkedDoc);
              links.push(linkAggregate);
            }
          }
        }
        const account = await this.accountDomainService.getPrivateAccount(rawData.username);
        if (account) {
          const extendedAction: Cooperative.Blockchain.IExtendedAction = {
            ...rawAction,
            user: account,
          };
          if (mainDocument) {
            const signedMainDoc: Cooperative.Document.ISignedDocument2 = {
              version: '1.0',
              hash: mainDocument.hash,
              doc_hash: mainDocument.hash,
              meta_hash: this.createMetaHash(mainDocument.meta),
              meta: mainDocument.meta,
              signatures: [
                {
                  id: 1,
                  signer: rawData.username,
                  public_key: (rawData.document as any).public_key,
                  signature: (rawData.document as any).signature,
                  signed_at: new Date().toISOString(),
                },
              ],
            };
            const documentAggregate = await this.documentAggregator.buildDocumentAggregate(signedMainDoc);
            statementDetail = {
              action: extendedAction,
              documentAggregate,
            };
          }
        }
      }
      // -----------------------------------------------------
      // ШАГ 2: Подготовка РЕШЕНИЯ (Decision)
      // -----------------------------------------------------
      {
        const decisionActionResponse = await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
          filter: JSON.stringify({
            account: SovietContract.contractName.production,
            name: SovietContract.Actions.Registry.NewDecision.actionName,
            receiver: process.env.COOPNAME,
            'data.decision_id': String(rawData.decision_id),
          }),
          page: 1,
          limit: 1,
        });
        const decisionAction = decisionActionResponse?.results?.[0];
        if (decisionAction) {
          const account = await this.accountDomainService.getPrivateAccount(decisionAction.data?.username);
          if (account) {
            const extendedDecisionAction: Cooperative.Blockchain.IExtendedAction = {
              ...decisionAction,
              user: account,
            };
            const decisionDocument = await this.getDocumentByHash(decisionAction?.data?.document?.hash);
            if (decisionDocument?.meta?.links && Array.isArray(decisionDocument.meta.links)) {
              for (const linkHash of decisionDocument.meta.links) {
                const linkedDoc = await this.getDocumentByHash(linkHash);
                if (linkedDoc) {
                  const signedLinkedDoc: Cooperative.Document.ISignedDocument2 = {
                    version: '1.0',
                    hash: linkedDoc.hash,
                    doc_hash: linkedDoc.hash,
                    meta_hash: this.createMetaHash(linkedDoc.meta),
                    meta: linkedDoc.meta,
                    signatures: [],
                  };
                  const linkAggregate = await this.documentAggregator.buildDocumentAggregate(signedLinkedDoc);
                  links.push(linkAggregate);
                }
              }
            }
            if (decisionDocument) {
              const signedDecisionDoc: Cooperative.Document.ISignedDocument2 = {
                version: '1.0',
                hash: decisionDocument.hash,
                doc_hash: decisionDocument.hash,
                meta_hash: this.createMetaHash(decisionDocument.meta),
                meta: decisionDocument.meta,
                signatures: [
                  {
                    id: 1,
                    signer: decisionAction.data?.username,
                    public_key: (decisionAction.data?.document as any)?.public_key || '',
                    signature: (decisionAction.data?.document as any)?.signature || '',
                    signed_at: new Date().toISOString(),
                  },
                ],
              };
              const documentAggregate = await this.documentAggregator.buildDocumentAggregate(signedDecisionDoc);
              decisionDetail = {
                action: extendedDecisionAction,
                documentAggregate,
                votes_for: [],
                votes_against: [],
              };
            }
          }
        }
      }
    } else {
      // --- НОВЫЙ ФОРМАТ (INewSubmitted2) ---
      const rawData: SovietContract.Actions.Registry.NewSubmitted2.INewSubmitted2 = rawAction.data;
      // -----------------------------------------------------
      // ШАГ 1: Подготовка ЗАЯВЛЕНИЯ (Statement)
      // -----------------------------------------------------
      {
        const mainDocument = await this.getDocumentByHash(rawData.document.hash);
        if (mainDocument?.meta?.links && Array.isArray(mainDocument.meta.links)) {
          for (const linkHash of mainDocument.meta.links) {
            const linkedDoc = await this.getDocumentByHash(linkHash);
            if (linkedDoc) {
              const signedLinkedDoc: Cooperative.Document.ISignedDocument2 = {
                version: rawData.document.version,
                hash: linkedDoc.hash,
                doc_hash: linkedDoc.hash,
                meta_hash: this.createMetaHash(linkedDoc.meta),
                meta: linkedDoc.meta,
                signatures: [],
              };
              const linkAggregate = await this.documentAggregator.buildDocumentAggregate(signedLinkedDoc);
              links.push(linkAggregate);
            }
          }
        }
        const account = await this.accountDomainService.getPrivateAccount(rawData.username);
        if (account) {
          const extendedAction: Cooperative.Blockchain.IExtendedAction = {
            ...rawAction,
            user: account,
          };
          if (mainDocument) {
            // signatures уже есть в rawData.document
            const signedMainDoc: Cooperative.Document.ISignedDocument2 = {
              version: rawData.document.version,
              hash: rawData.document.hash,
              doc_hash: rawData.document.doc_hash,
              meta_hash: rawData.document.meta_hash,
              meta: mainDocument.meta,
              signatures: rawData.document.signatures,
            };
            const documentAggregate = await this.documentAggregator.buildDocumentAggregate(signedMainDoc);
            statementDetail = {
              action: extendedAction,
              documentAggregate,
            };
          }
        }
      }
      // -----------------------------------------------------
      // ШАГ 2: Подготовка РЕШЕНИЯ (Decision)
      // -----------------------------------------------------
      {
        const decisionActionResponse = await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
          filter: JSON.stringify({
            account: SovietContract.contractName.production,
            name: SovietContract.Actions.Registry.NewDecision.actionName,
            receiver: process.env.COOPNAME,
            'data.decision_id': String(rawData.decision_id),
          }),
          page: 1,
          limit: 1,
        });
        const decisionAction = decisionActionResponse?.results?.[0];
        if (decisionAction) {
          const account = await this.accountDomainService.getPrivateAccount(decisionAction.data?.username);
          if (account) {
            const extendedDecisionAction: Cooperative.Blockchain.IExtendedAction = {
              ...decisionAction,
              user: account,
            };
            const decisionDocument = await this.getDocumentByHash(decisionAction?.data?.document?.hash);
            if (decisionDocument?.meta?.links && Array.isArray(decisionDocument.meta.links)) {
              for (const linkHash of decisionDocument.meta.links) {
                const linkedDoc = await this.getDocumentByHash(linkHash);
                if (linkedDoc) {
                  const signedLinkedDoc: Cooperative.Document.ISignedDocument2 = {
                    version: decisionAction.data?.document?.version,
                    hash: linkedDoc.hash,
                    doc_hash: linkedDoc.hash,
                    meta_hash: this.createMetaHash(linkedDoc.meta),
                    meta: linkedDoc.meta,
                    signatures: [],
                  };
                  const linkAggregate = await this.documentAggregator.buildDocumentAggregate(signedLinkedDoc);
                  links.push(linkAggregate);
                }
              }
            }
            if (decisionDocument) {
              // signatures уже есть в decisionAction.data.document
              const signedDecisionDoc: Cooperative.Document.ISignedDocument2 = {
                version: decisionAction.data?.document?.version,
                hash: decisionAction.data?.document?.hash,
                doc_hash: decisionAction.data?.document?.doc_hash,
                meta_hash: decisionAction.data?.document?.meta_hash,
                meta: decisionDocument.meta,
                signatures: decisionAction.data?.document?.signatures || [],
              };
              const documentAggregate = await this.documentAggregator.buildDocumentAggregate(signedDecisionDoc);
              decisionDetail = {
                action: extendedDecisionAction,
                documentAggregate,
                votes_for: [],
                votes_against: [],
              };
            }
          }
        }
      }
    }

    // -----------------------------------------------------
    // ШАГ 3: Подготовка АКТОВ (Acts)
    // -----------------------------------------------------
    // Здесь в дальнейшем может быть реализована логика для обработки актов
    // actDetails.push({ action: ..., documentAggregate: ... });

    // -----------------------------------------------------
    // ШАГ 4: Возвращаем итоговый объект DocumentPackageAggregate
    // -----------------------------------------------------
    const statement = statementDetail || null;
    const decision = decisionDetail || null;

    return {
      statement,
      decision,
      acts: actDetails,
      links,
    };
  }

  /**
   * Получает документ по хешу
   * @param hash Хеш документа
   * @returns Документ или null, если не найден
   */
  private async getDocumentByHash(hash: string): Promise<DocumentDomainEntity | null> {
    const document = await this.documentRepository.findByHash(hash);
    return document;
  }

  /**
   * Создает хеш метаданных документа
   * @param meta Метаданные документа
   * @returns SHA-256 хеш метаданных в hex-формате
   */
  private createMetaHash(meta: any): string {
    const metaStr = JSON.stringify(meta);
    const hash = crypto.createHash('sha256').update(metaStr).digest('hex');
    return hash;
  }
}
