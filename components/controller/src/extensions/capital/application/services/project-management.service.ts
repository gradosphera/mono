import { Injectable } from '@nestjs/common';
import { ProjectManagementInteractor } from '../use-cases/project-management.interactor';
import type { CreateProjectInputDTO } from '../dto/project_management';
import type { TransactResult } from '@wharfkit/session';
import type {
  SetMasterInputDTO,
  AddAuthorInputDTO,
  SetPlanInputDTO,
  StartProjectInputDTO,
  OpenProjectInputDTO,
  CloseProjectInputDTO,
  StopProjectInputDTO,
  DeleteProjectInputDTO,
  EditProjectInputDTO,
} from '../dto/project_management';
import { ProjectOutputDTO } from '../dto/project_management/project.dto';
import { ProjectFilterInputDTO } from '../dto/property_management/project-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { DocumentDomainInteractor } from '~/domain/document/interactors/document.interactor';
import { Cooperative } from 'cooptypes';

/**
 * Сервис уровня приложения для управления проектами CAPITAL
 * Обрабатывает запросы от ProjectManagementResolver
 */
@Injectable()
export class ProjectManagementService {
  constructor(
    private readonly projectManagementInteractor: ProjectManagementInteractor,
    private readonly documentDomainInteractor: DocumentDomainInteractor
  ) {}

  /**
   * Создание проекта в CAPITAL контракте
   */
  async createProject(data: CreateProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.createProject(data);
  }

  /**
   * Редактирование проекта в CAPITAL контракте
   */
  async editProject(data: EditProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.editProject(data);
  }

  /**
   * Установка мастера проекта CAPITAL контракта
   */
  async setMaster(data: SetMasterInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.setMaster(data);
  }

  /**
   * Добавление автора проекта CAPITAL контракта
   */
  async addAuthor(data: AddAuthorInputDTO): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.addAuthor(data);
    return project as ProjectOutputDTO;
  }

  /**
   * Установка плана проекта CAPITAL контракта
   */
  async setPlan(data: SetPlanInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.setPlan(data);
  }

  /**
   * Запуск проекта CAPITAL контракта
   */
  async startProject(data: StartProjectInputDTO): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.startProject(data);
    return project as ProjectOutputDTO;
  }

  /**
   * Открытие проекта для инвестиций CAPITAL контракта
   */
  async openProject(data: OpenProjectInputDTO): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.openProject(data);
    return project as ProjectOutputDTO;
  }

  /**
   * Закрытие проекта от инвестиций CAPITAL контракта
   */
  async closeProject(data: CloseProjectInputDTO): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.closeProject(data);
    return project as ProjectOutputDTO;
  }

  /**
   * Остановка проекта CAPITAL контракта
   */
  async stopProject(data: StopProjectInputDTO): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.stopProject(data);
    return project as ProjectOutputDTO;
  }

  /**
   * Удаление проекта CAPITAL контракта
   */
  async deleteProject(data: DeleteProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.deleteProject(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех проектов с фильтрацией
   */
  async getProjects(
    filter?: ProjectFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ProjectOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.projectManagementInteractor.getProjects(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as ProjectOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение проектов с компонентами с фильтрацией
   */
  async getProjectsWithComponents(
    filter?: ProjectFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ProjectOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.projectManagementInteractor.getProjectsWithComponents(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as ProjectOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение проекта по ID
   */
  async getProjectById(_id: string): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectById(_id);
    return project as ProjectOutputDTO | null;
  }

  /**
   * Получение проекта по ID
   */
  async getProjectByHash(hash: string): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectByHash(hash);
    return project as ProjectOutputDTO | null;
  }

  /**
   * Получение проекта по хешу с компонентами
   */
  async getProjectByHashWithComponents(hash: string): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectByHashWithComponents(hash);
    return project as ProjectOutputDTO | null;
  }

  /**
   * Получение проекта с отношениями
   */
  async getProjectWithRelations(projectHash: string): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectWithRelations(projectHash);
    return project as ProjectOutputDTO | null;
  }

  // ============ МЕТОДЫ ГЕНЕРАЦИИ ДОКУМЕНТОВ ============

  /**
   * Генерация приложения к генерационному соглашению
   */
  async generateAppendixGenerationAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.AppendixGenerationAgreement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }
}
