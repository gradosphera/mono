import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, DocumentRepository } from '../repository/document.repository';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import type { GenerateDocumentDomainInterface } from '../interfaces/generate-document-domain.interface';
import { DocumentDomainEntity } from '../entity/document-domain.entity';
import { Cooperative, SovietContract } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { User } from '~/models';
import { getActions } from '~/utils/getFetch';
import type { DocumentPackageDomainInterface } from '~/domain/agenda/interfaces/document-package-domain.interface';
import type { ActDetailDomainInterface } from '~/domain/agenda/interfaces/act-detail-domain.interface';
import type { DecisionDetailDomainInterface } from '~/domain/agenda/interfaces/decision-detail-domain.interface';
import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import type { StatementDetailDomainInterface } from '~/domain/agenda/interfaces/statement-detail-domain.interface';

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

  /**
   * Получает rawAction (блокчейн-действие), выстраивает DocumentPackage,
   * включающее заявление (statement), решение (decision), акты (acts) и связанные документы (links).
   */
  async buildDocumentPackage(rawAction: Cooperative.Blockchain.IAction): Promise<DocumentPackageDomainInterface> {
    // Инициализация частей будущего DocumentPackage
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
      const mainDocument = await this.getDocumentByHash(rawData.document.hash);

      // Если у документа есть ссылки, подгружаем их
      if (mainDocument?.meta?.links && Array.isArray(mainDocument.meta.links)) {
        for (const linkHash of mainDocument.meta.links) {
          const linkedDoc = await this.getDocumentByHash(linkHash);
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

        statementDetail = {
          action: extendedAction,
          document: mainDocument,
        };
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

          // Документ, прикреплённый к решению
          const decisionDocument = await this.getDocumentByHash(decisionAction?.data?.document?.hash);

          if (decisionDocument?.meta?.links && Array.isArray(decisionDocument.meta.links)) {
            for (const linkHash of decisionDocument.meta.links) {
              const linkedDoc = await this.getDocumentByHash(linkHash);
              if (linkedDoc) links.push(linkedDoc);
            }
          }

          decisionDetail = {
            action: extendedDecisionAction,
            document: decisionDocument,
            votes_for: [],
            votes_against: [],
          };
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
    const statement = statementDetail || ({ action: {}, document: {} } as StatementDetailDomainInterface);
    const decision: DecisionDetailDomainInterface =
      decisionDetail ||
      ({
        action: {} as unknown as ExtendedBlockchainActionDomainInterface,
        document: {} as unknown as GeneratedDocumentDomainInterface,
        votes_for: [],
        votes_against: [],
      } as unknown as DecisionDetailDomainInterface);

    return {
      statement,
      decision,
      acts: actDetails,
      links,
    };
  }
}
