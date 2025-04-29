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

    // Извлекаем данные (newSubmitted) из rawAction
    const rawData = rawAction.data as SovietContract.Actions.Registry.NewSubmitted.INewSubmitted;

    // -----------------------------------------------------
    // ШАГ 1: Подготовка ЗАЯВЛЕНИЯ (Statement)
    // -----------------------------------------------------
    {
      // Основной документ (statement)
      const mainDocument = await this.getDocumentByHash(rawData.document.hash);

      // Если у документа есть ссылки, подгружаем их
      if (mainDocument?.meta?.links && Array.isArray(mainDocument.meta.links)) {
        for (const linkHash of mainDocument.meta.links) {
          const linkedDoc = await this.getDocumentByHash(linkHash);

          if (linkedDoc) {
            // Создаем агрегат для связанного документа
            const linkAggregate = await this.documentAggregator.buildDocumentAggregate({
              hash: linkedDoc.hash,
              public_key: '',
              signature: '',
              meta: linkedDoc.meta,
            });
            links.push(linkAggregate);
          }
        }
      }

      // Ищем пользователя, оформившего заявление
      const account = await this.accountDomainService.getPrivateAccount(rawData.username);

      if (account) {
        // Формируем расширенный экшен
        const extendedAction: Cooperative.Blockchain.IExtendedAction = {
          ...rawAction,
          user: account,
        };

        if (mainDocument) {
          // Создаем агрегат для основного документа
          const documentAggregate = await this.documentAggregator.buildDocumentAggregate({
            hash: mainDocument.hash,
            public_key: rawData.document.public_key,
            signature: rawData.document.signature,
            meta: mainDocument.meta,
          });

          statementDetail = {
            action: extendedAction,
            documentAggregate,
          };
        } else {
          // console.log('mainDocument not found', rawData.document);
        }
      }
    }

    // -----------------------------------------------------
    // ШАГ 2: Подготовка РЕШЕНИЯ (Decision)
    // -----------------------------------------------------
    {
      // Ищем экшен, соответствующий созданию решения (NewDecision)
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

          // Документ, прикреплённый к решению
          const decisionDocument = await this.getDocumentByHash(decisionAction?.data?.document?.hash);

          if (decisionDocument?.meta?.links && Array.isArray(decisionDocument.meta.links)) {
            for (const linkHash of decisionDocument.meta.links) {
              const linkedDoc = await this.getDocumentByHash(linkHash);
              if (linkedDoc) {
                // Создаем агрегат для связанного документа
                const linkAggregate = await this.documentAggregator.buildDocumentAggregate({
                  hash: linkedDoc.hash,
                  public_key: '', // Не используется для links
                  signature: '', // Не используется для links
                  meta: linkedDoc.meta,
                });
                links.push(linkAggregate);
              }
            }
          }

          if (decisionDocument) {
            // Создаем агрегат для документа решения
            const documentAggregate = await this.documentAggregator.buildDocumentAggregate({
              hash: decisionDocument.hash,
              public_key: decisionAction.data?.document?.public_key || '',
              signature: decisionAction.data?.document?.signature || '',
              meta: decisionDocument.meta,
            });

            decisionDetail = {
              action: extendedDecisionAction,
              documentAggregate,
              votes_for: [],
              votes_against: [],
            };
          } else {
            console.log('decisionDocument not found', decisionAction?.data?.document);
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
}
