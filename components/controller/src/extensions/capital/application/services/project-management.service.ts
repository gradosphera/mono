import { Injectable } from '@nestjs/common';
import { ProjectManagementInteractor } from '../../domain/interactors/project-management.interactor';
import type { CreateProjectInputDTO } from '../dto/project_management';
import type { TransactResult } from '@wharfkit/session';
import type {
  SetMasterInputDTO,
  AddAuthorInputDTO,
  SetPlanInputDTO,
  StartProjectInputDTO,
  OpenProjectInputDTO,
  DeleteProjectInputDTO,
} from '../dto/project_management';
import { ProjectOutputDTO } from '../dto/project_management/project.dto';
import { ProjectFilterInputDTO } from '../dto/property_management/project-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис уровня приложения для управления проектами CAPITAL
 * Обрабатывает запросы от ProjectManagementResolver
 */
@Injectable()
export class ProjectManagementService {
  constructor(private readonly projectManagementInteractor: ProjectManagementInteractor) {}

  /**
   * Создание проекта в CAPITAL контракте
   */
  async createProject(data: CreateProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.createProject(data);
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
  async addAuthor(data: AddAuthorInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.addAuthor(data);
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
  async startProject(data: StartProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.startProject(data);
  }

  /**
   * Открытие проекта для инвестиций CAPITAL контракта
   */
  async openProject(data: OpenProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.openProject(data);
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
   * Получение проекта по ID
   */
  async getProjectById(_id: string): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectById(_id);
    return project as ProjectOutputDTO | null;
  }

  /**
   * Получение проекта с отношениями
   */
  async getProjectWithRelations(projectHash: string): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectWithRelations(projectHash);
    return project as ProjectOutputDTO | null;
  }
}
