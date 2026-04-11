import { Injectable } from '@nestjs/common';
import { InvestsManagementInteractor } from '../use-cases/invests-management.interactor';
import type { CreateProjectInvestInputDTO } from '../dto/invests_management/create-project-invest-input.dto';
import type { CreateProgramInvestInputDTO } from '../dto/invests_management/create-program-invest-input.dto';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import type { TransactResult } from '@wharfkit/session';
import { InvestOutputDTO } from '../dto/invests_management/invest.dto';
import { ProgramInvestOutputDTO } from '../dto/invests_management/program-invest.dto';
import { InvestFilterInputDTO } from '../dto/invests_management/invest-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';
import { Cooperative } from 'cooptypes';
import { generateRandomHash } from '~/utils/generate-hash.util';
import { CurrencyValidationUtil } from '~/utils/currency-validation.util';
import { ProgramInvestDomainEntity } from '../../domain/entities/program-invest.entity';
import { DocumentAggregateDTO } from '~/application/document/dto/document-aggregate.dto';
import { DocumentDomainAggregate } from '~/domain/document/aggregates/document-domain.aggregate';

/**
 * Сервис уровня приложения для управления инвестициями CAPITAL
 * Обрабатывает запросы от InvestsManagementResolver
 */
@Injectable()
export class InvestsManagementService {
  constructor(
    private readonly investsManagementInteractor: InvestsManagementInteractor,
    private readonly documentInteractor: DocumentInteractor
  ) {}

  /**
   * Инвестирование в проект CAPITAL контракта
   */
  async createProjectInvest(
    data: CreateProjectInvestInputDTO,
    currentUser: MonoAccountDomainInterface
  ): Promise<TransactResult> {
    // Генерируем уникальный хэш инвестиции
    const invest_hash = generateRandomHash();

    return await this.investsManagementInteractor.createProjectInvest(
      {
        ...data,
        invest_hash,
      },
      currentUser
    );
  }

  /**
   * Программная денежная инвестиция (createpinv)
   */
  async createProgramInvest(
    data: CreateProgramInvestInputDTO,
    currentUser: MonoAccountDomainInterface
  ): Promise<TransactResult> {
    CurrencyValidationUtil.validateCurrencySymbol(data.amount, 'сумме программной инвестиции');

    const invest_hash = generateRandomHash();

    return await this.investsManagementInteractor.createProgramInvest(
      {
        ...data,
        invest_hash,
      },
      currentUser
    );
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех инвестиций с фильтрацией
   */
  async getInvests(filter?: InvestFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<InvestOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.investsManagementInteractor.getInvests(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as InvestOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение инвестиции по ID
   */
  async getInvestById(_id: string): Promise<InvestOutputDTO | null> {
    const invest = await this.investsManagementInteractor.getInvestById(_id);
    return invest as InvestOutputDTO | null;
  }

  /**
   * Получение всех программных инвестиций
   */
  async getProgramInvests(
    filter?: InvestFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ProgramInvestOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.investsManagementInteractor.getProgramInvests(filter, domainOptions);

    return {
      items: await Promise.all(result.items.map((e) => this.mapProgramInvestToOutput(e))),
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение программной инвестиции по ID
   */
  async getProgramInvestById(_id: string): Promise<ProgramInvestOutputDTO | null> {
    const programInvest = await this.investsManagementInteractor.getProgramInvestById(_id);
    return programInvest ? await this.mapProgramInvestToOutput(programInvest) : null;
  }

  private async mapProgramInvestToOutput(entity: ProgramInvestDomainEntity): Promise<ProgramInvestOutputDTO> {
    const dto = new ProgramInvestOutputDTO();
    dto._id = entity._id;
    dto.block_num = entity.block_num ?? undefined;
    dto.present = entity.present;
    dto._created_at = entity._created_at;
    dto._updated_at = entity._updated_at;
    dto.id = entity.id;
    dto.status = entity.status;
    dto.invest_hash = entity.invest_hash;
    dto.coopname = entity.coopname;
    dto.username = entity.username;
    dto.blockchain_status = entity.blockchain_status;
    dto.invested_at = entity.invested_at;
    dto.amount = entity.amount;
    dto.statement = await this.buildProgramInvestStatementAggregate(entity.statement);
    return dto;
  }

  private async buildProgramInvestStatementAggregate(
    statement: ProgramInvestDomainEntity['statement'],
  ): Promise<DocumentAggregateDTO | undefined> {
    const aggregate = await this.documentInteractor.buildDocumentAggregate(statement);
    if (!aggregate) return undefined;
    return new DocumentAggregateDTO(aggregate as DocumentDomainAggregate);
  }

  // ============ МЕТОДЫ ГЕНЕРАЦИИ ДОКУМЕНТОВ ============

  /**
   * Генерация заявления об инвестировании в капитализацию
   */
  async generateCapitalizationMoneyInvestStatement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.CapitalizationMoneyInvestStatement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }
}
