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
import { PermissionsService } from './permissions.service';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';

/**
 * Сервис уровня приложения для управления проектами CAPITAL
 * Обрабатывает запросы от ProjectManagementResolver
 */
@Injectable()
export class ProjectManagementService {
  constructor(
    private readonly projectManagementInteractor: ProjectManagementInteractor,
    private readonly documentDomainInteractor: DocumentDomainInteractor,
    private readonly permissionsService: PermissionsService
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
  async addAuthor(data: AddAuthorInputDTO, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.addAuthor(data);

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
  }

  /**
   * Установка плана проекта CAPITAL контракта
   */
  async setPlan(data: SetPlanInputDTO, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO> {
    // Находим проект для проверки прав
    const project = await this.projectManagementInteractor.getProjectByHash(data.project_hash);
    if (!project) {
      throw new Error(`Проект с хешем ${data.project_hash} не найден`);
    }

    // Проверяем права доступа
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);
    if (!permissions.can_set_plan) {
      throw new Error('Недостаточно прав для установки плана проекта');
    }

    // Выполняем операцию установки плана
    await this.projectManagementInteractor.setPlan(data);

    // Получаем обновленный проект после установки плана
    const updatedProject = await this.projectManagementInteractor.getProjectByHash(data.project_hash);
    if (!updatedProject) {
      throw new Error(`Не удалось получить обновленный проект после установки плана`);
    }

    // Рассчитываем права доступа для обновленного проекта
    const updatedPermissions = await this.permissionsService.calculateProjectPermissions(updatedProject, currentUser);

    return {
      ...updatedProject,
      permissions: updatedPermissions,
    } as ProjectOutputDTO;
  }

  /**
   * Запуск проекта CAPITAL контракта
   */
  async startProject(data: StartProjectInputDTO, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.startProject(data);

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
  }

  /**
   * Открытие проекта для инвестиций CAPITAL контракта
   */
  async openProject(data: OpenProjectInputDTO, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.openProject(data);

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
  }

  /**
   * Закрытие проекта от инвестиций CAPITAL контракта
   */
  async closeProject(data: CloseProjectInputDTO, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.closeProject(data);

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
  }

  /**
   * Остановка проекта CAPITAL контракта
   */
  async stopProject(data: StopProjectInputDTO, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO> {
    const project = await this.projectManagementInteractor.stopProject(data);

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
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
    options?: PaginationInputDTO,
    currentUser?: MonoAccountDomainInterface
  ): Promise<PaginationResult<ProjectOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.projectManagementInteractor.getProjects(filter, domainOptions);

    // Рассчитываем права доступа для всех проектов пакетно
    const permissionsMap = await this.permissionsService.calculateBatchProjectPermissions(result.items, currentUser);

    // Обогащаем проекты правами доступа
    const itemsWithPermissions = result.items.map((project) => {
      const permissions = permissionsMap.get(project.project_hash);
      return {
        ...project,
        permissions,
      } as ProjectOutputDTO;
    });

    // Конвертируем результат в DTO
    return {
      items: itemsWithPermissions,
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
    options?: PaginationInputDTO,
    currentUser?: MonoAccountDomainInterface
  ): Promise<PaginationResult<ProjectOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.projectManagementInteractor.getProjectsWithComponents(filter, domainOptions);

    // Собираем все проекты (родительские + компоненты) для расчета прав
    // components добавляется динамически в репозитории через (project as any).components
    const allProjects = result.items.flatMap((project) => {
      const components = (project as any).components as ProjectDomainEntity[] | undefined;
      return [project, ...(components || [])];
    });

    // Рассчитываем права доступа для всех проектов пакетно
    const permissionsMap = await this.permissionsService.calculateBatchProjectPermissions(allProjects, currentUser);

    // Обогащаем проекты правами доступа
    const itemsWithPermissions = result.items.map((project) => {
      const projectPermissions = permissionsMap.get(project.project_hash);

      // Получаем компоненты (они добавлены динамически в репозитории)
      const components = (project as ProjectOutputDTO).components as ProjectDomainEntity[] | undefined;

      // Обогащаем компоненты правами доступа
      const componentsWithPermissions = components?.map((component) => {
        const componentPermissions = permissionsMap.get(component.project_hash);
        return {
          ...component,
          permissions: componentPermissions,
        };
      });

      return {
        ...project,
        permissions: projectPermissions,
        components: componentsWithPermissions,
      } as ProjectOutputDTO;
    });

    // Конвертируем результат в DTO
    return {
      items: itemsWithPermissions,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение проекта по ID
   */
  async getProjectById(_id: string, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectById(_id);

    if (!project) {
      return null;
    }

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    // Возвращаем проект с правами доступа
    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
  }

  /**
   * Получение проекта по хешу
   */
  async getProjectByHash(hash: string, currentUser?: MonoAccountDomainInterface): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectByHash(hash);

    if (!project) {
      return null;
    }

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    // Возвращаем проект с правами доступа
    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
  }

  /**
   * Получение проекта по хешу с компонентами
   */
  async getProjectByHashWithComponents(
    hash: string,
    currentUser?: MonoAccountDomainInterface
  ): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectByHashWithComponents(hash);

    if (!project) {
      return null;
    }

    // Получаем компоненты (они добавлены динамически в репозитории)
    const components = (project as any).components as ProjectDomainEntity[] | undefined;

    // Собираем все проекты (родительский + компоненты) для расчета прав
    const allProjects = [project, ...(components || [])];

    // Рассчитываем права доступа для всех проектов пакетно
    const permissionsMap = await this.permissionsService.calculateBatchProjectPermissions(allProjects, currentUser);

    // Обогащаем проект и компоненты правами доступа
    const projectPermissions = permissionsMap.get(project.project_hash);

    const componentsWithPermissions = components?.map((component) => {
      const componentPermissions = permissionsMap.get(component.project_hash);
      return {
        ...component,
        permissions: componentPermissions,
      };
    });

    return {
      ...project,
      permissions: projectPermissions,
      components: componentsWithPermissions,
    } as ProjectOutputDTO;
  }

  /**
   * Получение проекта с отношениями
   */
  async getProjectWithRelations(
    projectHash: string,
    currentUser?: MonoAccountDomainInterface
  ): Promise<ProjectOutputDTO | null> {
    const project = await this.projectManagementInteractor.getProjectWithRelations(projectHash);

    if (!project) {
      return null;
    }

    // Рассчитываем права доступа для проекта
    const permissions = await this.permissionsService.calculateProjectPermissions(project, currentUser);

    // Возвращаем проект с правами доступа
    return {
      ...project,
      permissions,
    } as ProjectOutputDTO;
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
