import { Injectable } from '@nestjs/common';
import { DocumentAggregator } from './document.aggregator';
import { DocumentPackageUtils } from './document-package-utils.aggregator';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { Cooperative, SovietContract } from 'cooptypes';
import { getActions } from '~/utils/getFetch';
import type { DocumentPackageAggregateDomainInterface } from '../interfaces/document-package-aggregate-domain.interface';
import type { StatementDetailAggregateDomainInterface } from '../interfaces/statement-detail-aggregate-domain.interface';
import type { DecisionDetailAggregateDomainInterface } from '../interfaces/decision-detail-aggregate-domain.interface';
import type { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import type { ISignedDocumentDomainInterface } from '../interfaces/signed-document-domain.interface';

@Injectable()
export class DocumentPackageV1Aggregator {
  constructor(
    private readonly documentAggregator: DocumentAggregator,
    private readonly documentPackageUtils: DocumentPackageUtils,
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Обрабатывает пакет документов версии 1 и выше (новый формат)
   * @param rawAction Блокчейн-действие
   * @returns Агрегат пакета документов
   */
  async buildDocumentPackageAggregateV1(
    rawAction: Cooperative.Blockchain.IAction
  ): Promise<DocumentPackageAggregateDomainInterface> {
    // Инициализация частей
    let statementDetail: StatementDetailAggregateDomainInterface | null = null;
    let decisionDetail: DecisionDetailAggregateDomainInterface | null = null;
    const actDetails = [];
    const links: DocumentDomainAggregate[] = [];

    // Обработка данных в новом формате
    const rawData: SovietContract.Actions.Registry.NewSubmitted.INewSubmitted = rawAction.data;

    // Создаем заявление (Statement)
    statementDetail = await this.buildStatementV1(rawAction, rawData, links);

    // Создаем решение (Decision)
    decisionDetail = await this.buildDecisionV1(rawData, links);

    // Возвращаем итоговый объект
    return {
      statement: statementDetail,
      decision: decisionDetail,
      acts: actDetails,
      links,
    };
  }

  /**
   * Создает заявление (Statement) для версии 1+
   * @param rawAction Блокчейн-действие
   * @param rawData Данные действия
   * @param links Массив связанных документов
   * @returns Детали заявления
   */
  private async buildStatementV1(
    rawAction: Cooperative.Blockchain.IAction,
    rawData: SovietContract.Actions.Registry.NewSubmitted.INewSubmitted,
    links: DocumentDomainAggregate[]
  ): Promise<StatementDetailAggregateDomainInterface | null> {
    const mainDocument = await this.documentPackageUtils.getDocumentByHash(rawData.document.doc_hash);
    if (!mainDocument) return null;

    if (mainDocument?.meta?.links && Array.isArray(mainDocument.meta.links)) {
      for (const linkHash of mainDocument.meta.links) {
        const linkedDoc = await this.documentPackageUtils.getDocumentByHash(linkHash);
        if (linkedDoc) {
          // поиск соглашения по документу
          const rawAgreement = await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
            filter: JSON.stringify({
              account: SovietContract.contractName.production,
              name: SovietContract.Actions.Registry.NewAgreement.actionName,
              receiver: process.env.COOPNAME,
              'data.document.doc_hash': String(linkHash.toUpperCase()),
            }),
            page: 1,
            limit: 1,
          });

          const agreement: SovietContract.Actions.Registry.NewAgreement.INewAgreement = rawAgreement?.results?.[0]?.data;

          if (agreement) {
            const signedLinkedDoc: ISignedDocumentDomainInterface = {
              version: rawData.document.version,
              hash: linkedDoc.hash,
              doc_hash: linkedDoc.hash,
              meta_hash: agreement.document.meta_hash,
              meta: JSON.parse(agreement.document.meta),
              signatures: agreement.document.signatures || [],
            };

            const linkAggregate = await this.documentAggregator.buildDocumentAggregate(signedLinkedDoc);
            if (linkAggregate) {
              links.push(linkAggregate);
            }
          }
        }
      }
    }

    const account = await this.accountDomainService.getPrivateAccount(rawData.username);
    if (!account) return null;

    const extendedAction: Cooperative.Blockchain.IExtendedAction = {
      ...rawAction,
      user: account,
    };

    // signatures уже есть в rawData.document
    const signedMainDoc: ISignedDocumentDomainInterface = {
      version: rawData.document.version,
      hash: rawData.document.hash,
      doc_hash: rawData.document.doc_hash,
      meta_hash: rawData.document.meta_hash,
      meta: mainDocument.meta,
      signatures: rawData.document.signatures,
    };

    const documentAggregate = await this.documentAggregator.buildDocumentAggregate(signedMainDoc);
    if (documentAggregate) {
      return {
        action: extendedAction,
        documentAggregate,
      };
    }

    return null;
  }

  /**
   * Создает решение (Decision) для версии 1+
   * @param rawData Данные действия
   * @param links Массив связанных документов
   * @returns Детали решения
   */
  private async buildDecisionV1(
    rawData: SovietContract.Actions.Registry.NewSubmitted.INewSubmitted,
    links: DocumentDomainAggregate[]
  ): Promise<DecisionDetailAggregateDomainInterface | null> {
    const decisionActionResponse = await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
      filter: JSON.stringify({
        account: SovietContract.contractName.production,
        name: SovietContract.Actions.Registry.NewDecision.actionName,
        receiver: process.env.COOPNAME,
        'data.package': String(rawData.package.toUpperCase()),
      }),
      page: 1,
      limit: 1,
    });

    const decisionAction = decisionActionResponse?.results?.[0];
    if (!decisionAction) return null;

    const account = await this.accountDomainService.getPrivateAccount(decisionAction.data?.username);
    if (!account) return null;

    const extendedDecisionAction: Cooperative.Blockchain.IExtendedAction = {
      ...decisionAction,
      user: account,
    };

    const decisionDocument = await this.documentPackageUtils.getDocumentByHash(decisionAction?.data?.document?.doc_hash);
    if (!decisionDocument) return null;

    if (decisionDocument?.meta?.links && Array.isArray(decisionDocument.meta.links)) {
      for (const linkHash of decisionDocument.meta.links) {
        const linkedDoc = await this.documentPackageUtils.getDocumentByHash(linkHash);
        if (linkedDoc) {
          // поиск соглашения по документу
          const rawAgreement = await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
            filter: JSON.stringify({
              account: SovietContract.contractName.production,
              name: SovietContract.Actions.Registry.NewAgreement.actionName,
              receiver: process.env.COOPNAME,
              'data.document.doc_hash': String(linkHash.toUpperCase()),
            }),
            page: 1,
            limit: 1,
          });

          const agreement: SovietContract.Actions.Registry.NewAgreement.INewAgreement = rawAgreement?.results?.[0]?.data;

          if (agreement) {
            const signedLinkedDoc: ISignedDocumentDomainInterface = {
              version: decisionAction.data?.document?.version,
              hash: linkedDoc.hash,
              doc_hash: linkedDoc.hash,
              meta_hash: agreement.document.meta_hash,
              meta: JSON.parse(agreement.document.meta),
              signatures: agreement.document.signatures || [],
            };

            const linkAggregate = await this.documentAggregator.buildDocumentAggregate(signedLinkedDoc);
            if (linkAggregate) {
              links.push(linkAggregate);
            }
          }
        }
      }
    }

    // signatures уже есть в decisionAction.data.document
    const signedDecisionDoc: ISignedDocumentDomainInterface = {
      version: decisionAction.data?.document?.version,
      hash: decisionAction.data?.document?.hash,
      doc_hash: decisionAction.data?.document?.doc_hash,
      meta_hash: decisionAction.data?.document?.meta_hash,
      meta: decisionDocument.meta,
      signatures: decisionAction.data?.document?.signatures || [],
    };

    const documentAggregate = await this.documentAggregator.buildDocumentAggregate(signedDecisionDoc);
    if (documentAggregate) {
      return {
        action: extendedDecisionAction,
        documentAggregate,
        votes_for: [],
        votes_against: [],
      };
    }

    return null;
  }
}
