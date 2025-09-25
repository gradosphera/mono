import { Injectable } from '@nestjs/common';
import { ParticipationManagementInteractor } from '../use-cases/participation-management.interactor';
import type { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import type { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';
import type { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import type { TransactResult } from '@wharfkit/session';
import { ContributorOutputDTO } from '../dto/participation_management/contributor.dto';
import { ContributorFilterInputDTO } from '../dto/participation_management/contributor-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { DocumentDomainInteractor } from '~/domain/document/interactors/document.interactor';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import type { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { Cooperative } from 'cooptypes';

/**
 * Сервис уровня приложения для управления участием в CAPITAL
 * Обрабатывает запросы от ParticipationManagementResolver
 */
@Injectable()
export class ParticipationManagementService {
  constructor(
    private readonly participationManagementInteractor: ParticipationManagementInteractor,
    private readonly documentAggregationService: DocumentAggregationService,
    private readonly documentDomainInteractor: DocumentDomainInteractor
  ) {}

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  async importContributor(data: ImportContributorInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.importContributor(data);
  }

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorInputDTO): Promise<TransactResult> {
    const result = await this.participationManagementInteractor.registerContributor(data);
    return result;
  }

  /**
   * Подписание приложения в CAPITAL контракте
   */
  async makeClearance(data: MakeClearanceInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.makeClearance(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех вкладчиков с фильтрацией
   */
  async getContributors(
    filter?: ContributorFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ContributorOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.participationManagementInteractor.getContributors(filter, domainOptions);

    // Асинхронная обработка каждого элемента с использованием маппера
    const items = await Promise.all(result.items.map((item) => this.mapContributorToOutputDTO(item)));

    // Конвертируем результат в DTO
    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение вкладчика по ID
   */
  async getContributorById(_id: string): Promise<ContributorOutputDTO | null> {
    const contributor = await this.participationManagementInteractor.getContributorById(_id);
    return contributor ? await this.mapContributorToOutputDTO(contributor) : null;
  }

  /**
   * Получение вкладчика по критериям поиска
   */
  async getContributorByCriteria(criteria: {
    _id?: string;
    username?: string;
    contributor_hash?: string;
  }): Promise<ContributorOutputDTO | null> {
    const contributor = await this.participationManagementInteractor.getContributorByCriteria(criteria);
    return contributor ? await this.mapContributorToOutputDTO(contributor) : null;
  }

  /**
   * Маппинг доменной сущности в DTO
   */
  private async mapContributorToOutputDTO(contributor: ContributorDomainEntity): Promise<ContributorOutputDTO> {
    // Асинхронная обработка контракта с использованием DocumentAggregationService
    const contract = contributor.contract
      ? await this.documentAggregationService.buildDocumentAggregate(contributor.contract)
      : null;

    return {
      ...contributor,
      contract,
    };
  }

  // ============ МЕТОДЫ ГЕНЕРАЦИИ ДОКУМЕНТОВ ============

  /**
   * Генерация соглашения о капитализации
   */
  async generateCapitalizationAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.CapitalizationAgreement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }

  /**
   * Генерация генерационного соглашения
   */
  async generateGenerationAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.GenerationAgreement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }
}
