import { Injectable } from '@nestjs/common';
import { ParticipationManagementInteractor } from '../use-cases/participation-management.interactor';
import type { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import type { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';
import type { EditContributorInputDTO } from '../dto/participation_management/edit-contributor-input.dto';
import type { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import type { TransactResult } from '@wharfkit/session';
import { ContributorOutputDTO } from '../dto/participation_management/contributor.dto';
import { ContributorFilterInputDTO } from '../dto/participation_management/contributor-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';
import { ContributorMapperService } from './contributor-mapper.service';
import { ContributorSyncService } from '../syncers/contributor-sync.service';
import { Cooperative } from 'cooptypes';

/**
 * Сервис уровня приложения для управления участием в CAPITAL
 * Обрабатывает запросы от ParticipationManagementResolver
 */
@Injectable()
export class ParticipationManagementService {
  constructor(
    private readonly participationManagementInteractor: ParticipationManagementInteractor,
    private readonly contributorMapperService: ContributorMapperService,
    private readonly contributorSyncService: ContributorSyncService,
    private readonly documentInteractor: DocumentInteractor
  ) {}

  /**
   * Импорт участника в CAPITAL контракт
   */
  async importContributor(data: ImportContributorInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.importContributor(data);
  }

  /**
   * Регистрация участника в CAPITAL контракте
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

  /**
   * Редактирование участника в CAPITAL контракте
   */
  async editContributor(data: EditContributorInputDTO): Promise<ContributorOutputDTO> {
    // Выполняем транзакцию редактирования
    const transactResult = await this.participationManagementInteractor.editContributor(data);

    // Синхронизируем данные из блокчейна
    const syncedContributor = await this.contributorSyncService.syncContributor(
      data.coopname,
      data.username,
      transactResult
    );

    if (!syncedContributor) {
      throw new Error('Не удалось синхронизировать данные участника после редактирования');
    }

    // Возвращаем отмапленного участника
    return await this.contributorMapperService.mapContributorToOutputDTO(syncedContributor);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех участников с фильтрацией
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
    const items = await Promise.all(
      result.items.map((item) => this.contributorMapperService.mapContributorToOutputDTO(item))
    );

    // Конвертируем результат в DTO
    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение участника по ID
   */
  async getContributorById(_id: string): Promise<ContributorOutputDTO | null> {
    const contributor = await this.participationManagementInteractor.getContributorById(_id);
    return contributor ? await this.contributorMapperService.mapContributorToOutputDTO(contributor) : null;
  }

  /**
   * Получение участника по критериям поиска
   */
  async getContributorByCriteria(criteria: {
    _id?: string;
    username?: string;
    contributor_hash?: string;
  }): Promise<ContributorOutputDTO | null> {
    const contributor = await this.participationManagementInteractor.getContributorByCriteria(criteria);
    return contributor ? await this.contributorMapperService.mapContributorToOutputDTO(contributor) : null;
  }

  // ============ МЕТОДЫ ГЕНЕРАЦИИ ДОКУМЕНТОВ ============

  /**
   * Генерация соглашения о капитализации
   */
  async generateCapitalizationAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentInteractor.generateDocument({
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
    const document = await this.documentInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.GenerationAgreement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }
}
