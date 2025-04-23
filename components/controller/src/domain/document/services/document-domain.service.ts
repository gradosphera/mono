import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import type { GenerateDocumentDomainInterfaceWithOptions } from '../interfaces/generate-document-domain-with-options.interface';
import { DocumentDomainEntity } from '../entity/document-domain.entity';
import { Cooperative, SovietContract } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { User } from '~/models';
import { getActions } from '~/utils/getFetch';
import type { DocumentPackageDomainInterface } from '~/domain/agenda/interfaces/document-package-domain.interface';
import type { ActDetailDomainInterface } from '~/domain/agenda/interfaces/act-detail-domain.interface';
import type { DecisionDetailDomainInterface } from '~/domain/agenda/interfaces/decision-detail-domain.interface';
import type { StatementDetailDomainInterface } from '~/domain/agenda/interfaces/statement-detail-domain.interface';
import { DocumentDomainAggregate } from '../aggregates/document-domain.aggregate';
import type { DocumentMetaDomainInterface } from '../interfaces/document-meta-domain.interface';
import { DocumentAggregator } from '../aggregators/document.aggregator';

@Injectable()
export class DocumentDomainService {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    private readonly generatorInfrastructureService: GeneratorInfrastructureService,
    private readonly documentAggregator: DocumentAggregator
  ) {}

  public async generateDocument(data: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    return await this.generatorInfrastructureService.generateDocument(data);
  }

  public async getDocumentByHash(hash: string): Promise<DocumentDomainEntity | null> {
    const document = await this.documentRepository.findByHash(hash);
    return document;
  }

  /**
   * Получает rawAction (блокчейн-действие), выстраивает DocumentPackage,
   * включающее заявление (statement), решение (decision), акты (acts) и связанные документы (links).
   */
  async buildDocumentPackage(rawAction: Cooperative.Blockchain.IAction): Promise<DocumentPackageDomainInterface> {
    // Инициализация частей будущего DocumentPackage
    const showLog = rawAction.data.decision_id == 2 || rawAction.data.decision_id == 4;
    if (showLog) console.log('rawAction', 'LOG IT! WTF: ', rawAction);
    let statementDetail: StatementDetailDomainInterface | null = null;
    let decisionDetail: DecisionDetailDomainInterface | null = null;
    const actDetails: ActDetailDomainInterface[] = [];
    const links: GeneratedDocumentDomainInterface[] = [];

    // Извлекаем данные (newSubmitted) из rawAction
    const rawData = rawAction.data as SovietContract.Actions.Registry.NewSubmitted.INewSubmitted;

    // -----------------------------------------------------
    // ШАГ 1: Подготовка ЗАЯВЛЕНИЯ (Statement)
    // -----------------------------------------------------
    {
      // Основной документ (statement)
      if (showLog) console.log('rawData.document', rawData.document.hash, rawData.document.meta);
      const mainDocument = await this.getDocumentByHash(rawData.document.hash);

      // Если у документа есть ссылки, подгружаем их
      if (mainDocument?.meta?.links && Array.isArray(mainDocument.meta.links)) {
        for (const linkHash of mainDocument.meta.links) {
          const linkedDoc = await this.getDocumentByHash(linkHash);
          if (showLog) console.log('linkedDoc', linkedDoc?.meta.title);
          if (linkedDoc) links.push(linkedDoc);
        }
      }

      // Ищем пользователя, оформившего заявление
      const user = await User.findOne({ username: rawData.username });
      if (user) {
        const userData = await user.getPrivateData();

        // Формируем расширенный экшен
        const extendedAction: Cooperative.Blockchain.IExtendedAction = {
          ...rawAction,
          user: userData,
        };

        if (mainDocument) {
          if (showLog) console.log('mainDocument', mainDocument.hash, mainDocument.meta);
          statementDetail = {
            action: extendedAction,
            document: mainDocument,
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
        const user = await User.findOne({ username: decisionAction.data?.username });

        if (user) {
          const userData = await user.getPrivateData();
          const extendedDecisionAction: Cooperative.Blockchain.IExtendedAction = {
            ...decisionAction,
            user: userData ?? null,
          };

          if (showLog)
            console.log('decisionAction', decisionAction.data?.document?.hash, decisionAction.data?.document?.meta);
          // Документ, прикреплённый к решению
          const decisionDocument = await this.getDocumentByHash(decisionAction?.data?.document?.hash);
          if (showLog) console.log('decisionDocument', decisionDocument?.meta);
          if (decisionDocument?.meta?.links && Array.isArray(decisionDocument.meta.links)) {
            for (const linkHash of decisionDocument.meta.links) {
              const linkedDoc = await this.getDocumentByHash(linkHash);
              if (showLog) console.log('linkedDoc', linkedDoc?.meta);
              if (linkedDoc) links.push(linkedDoc);
            }
          }
          if (decisionDocument) {
            decisionDetail = {
              action: extendedDecisionAction,
              document: decisionDocument,
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
    // Здесь в примере просто пустой массив,
    // но если нужно обрабатывать акты, добавьте логику получения
    // и пушите объекты вида `ActDetailDomainInterface`.
    // actDetails.push({ action: ..., document: ... });

    // -----------------------------------------------------
    // ШАГ 4: Возвращаем итоговый объект DocumentPackage
    // -----------------------------------------------------
    // Если statementDetail или decisionDetail вдруг оказались null —
    // можно обработать это или бросить ошибку, в зависимости от бизнес-логики.
    // Здесь для примера присваиваем пустые объекты:
    const statement = statementDetail || null;
    const decision = decisionDetail || null;
    if (showLog) console.log({ statement, decision, acts: actDetails, links });

    return {
      statement,
      decision,
      acts: actDetails,
      links,
    };
  }

  /**
   * Создает агрегатор документов на основе полного документа и подписанного документа
   * Делегирует выполнение к DocumentAggregator
   * @param signedDoc Подписанный документ (метаинформация)
   * @returns Агрегатор документов
   */
  public async buildDocumentAggregate<T extends DocumentMetaDomainInterface>(
    signedDoc: Cooperative.Document.ISignedDocument<T>
  ): Promise<DocumentDomainAggregate<T>> {
    return this.documentAggregator.buildDocumentAggregate(signedDoc);
  }
}
