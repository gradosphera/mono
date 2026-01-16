import { Injectable } from '@nestjs/common';
import { ParticipationManagementInteractor } from '../use-cases/participation-management.interactor';
import { ProjectManagementInteractor } from '../use-cases/project-management.interactor';
import type { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import type { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';
import type { EditContributorInputDTO } from '../dto/participation_management/edit-contributor-input.dto';
import type { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import type { MakeClearanceDomainInput } from '../../domain/actions/make-clearance-domain-input.interface';
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
import { GenerationAgreementGenerateDocumentInputDTO } from '~/application/document/documents-dto/generation-agreement-document.dto';
import { AppendixGenerationAgreementGenerateDocumentInputDTO } from '~/application/document/documents-dto/appendix-generation-agreement-document.dto';
import { HttpApiError } from '~/utils/httpApiError';
import httpStatus from 'http-status';
import { randomBytes } from 'crypto';

/**
 * Сервис уровня приложения для управления участием в CAPITAL
 * Обрабатывает запросы от ParticipationManagementResolver
 */
@Injectable()
export class ParticipationManagementService {
  constructor(
    private readonly participationManagementInteractor: ParticipationManagementInteractor,
    private readonly projectManagementInteractor: ProjectManagementInteractor,
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
   * Генерация документа приложения к договору участия
   * Извлекает все необходимые данные на бэкенде по project_hash
   */
  async generateAppendixGenerationAgreement(
    data: AppendixGenerationAgreementGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // 1. Получаем данные участника
    const contributor = await this.participationManagementInteractor.getContributorByCriteria({
      username: data.username,
    });

    if (!contributor) {
      throw new HttpApiError(httpStatus.NOT_FOUND, `Участник ${data.username} не найден`);
    }

    // 2. Получаем данные проекта
    const project = await this.projectManagementInteractor.getProjectByHash(data.project_hash);

    if (!project) {
      throw new HttpApiError(httpStatus.NOT_FOUND, `Проект с хэшем ${data.project_hash} не найден`);
    }

    // 3. Определяем, является ли проект компонентом
    const isComponent = !!project.parent_hash;

    // 4. Если компонент - получаем родительский проект
    let parentProject: Awaited<ReturnType<typeof this.projectManagementInteractor.getProjectByHash>> = null;
    if (isComponent && project.parent_hash) {
      parentProject = await this.projectManagementInteractor.getProjectByHash(project.parent_hash);
      if (!parentProject) {
        throw new HttpApiError(httpStatus.NOT_FOUND, `Родительский проект с хэшем ${project.parent_hash} не найден`);
      }
    }

    // 5. Генерируем уникальный хэш для приложения
    const appendix_hash = `A${Date.now().toString(36).toUpperCase()}${randomBytes(3).toString('hex').toUpperCase()}`;

    // 6. Формируем данные для генерации документа
    const documentData = {
      coopname: data.coopname,
      username: data.username,
      lang: data.lang || 'ru',
      registry_id: Cooperative.Registry.AppendixGenerationAgreement.registry_id,
      appendix_hash,
      contributor_hash: contributor.contributor_hash,
      contributor_created_at: contributor.created_at,
      component_name: isComponent ? project.title || project.data || '' : '',
      component_id: isComponent ? project.project_hash : '',
      project_name: isComponent ? parentProject?.title || parentProject?.data || '' : project.title || project.data || '',
      project_id: isComponent ? project.parent_hash || '' : project.project_hash,
      is_component: isComponent,
    };

    // 7. Генерируем документ
    const document = await this.documentInteractor.generateDocument({
      data: documentData,
      options: options || {},
    });

    return document as GeneratedDocumentDTO;
  }

  /**
   * Подписание приложения в CAPITAL контракте
   * Теперь принимает минимальный набор данных и подписанный документ
   */
  async makeClearance(data: MakeClearanceInputDTO): Promise<TransactResult> {
    // Извлекаем документ из базы данных для верификации
    const document = await this.documentInteractor.getDocumentByHash(data.document.hash);

    if (!document) {
      throw new HttpApiError(httpStatus.BAD_REQUEST, `Документ с хэшем ${data.document.hash} не найден`);
    }

    // Извлекаем appendix_hash из метаданных документа
    const appendix_hash = (document.meta as any).appendix_hash;

    if (!appendix_hash) {
      throw new HttpApiError(httpStatus.BAD_REQUEST, 'В документе отсутствует appendix_hash');
    }

    // Формируем доменный input с полными данными
    const domainInput: MakeClearanceDomainInput = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      appendix_hash,
      document: data.document,
      contribution: data.contribution,
    };

    return await this.participationManagementInteractor.makeClearance(domainInput);
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
    data: GenerationAgreementGenerateDocumentInputDTO,
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
