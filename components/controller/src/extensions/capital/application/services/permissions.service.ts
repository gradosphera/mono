import { Injectable, Inject } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/repositories/project.repository';
import { APPENDIX_REPOSITORY, AppendixRepository } from '../../domain/repositories/appendix.repository';
import type { IssueDomainEntity } from '../../domain/entities/issue.entity';
import type { ProjectDomainEntity } from '../../domain/entities/project.entity';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { IssuePermissionsOutputDTO } from '../dto/generation/issue-permissions.dto';
import { ProjectPermissionsOutputDTO } from '../dto/project_management/project-permissions.dto';

/**
 * Сервис для расчета прав доступа пользователя к объектам CAPITAL системы
 * Централизует логику определения возможностей пользователя для задач и проектов
 */
@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(APPENDIX_REPOSITORY)
    private readonly appendixRepository: AppendixRepository
  ) {}

  /**
   * Проверяет, является ли пользователь членом совета (chairman или member)
   * @param currentUser - текущий пользователь (может быть undefined для гостей)
   * @returns true если пользователь имеет роль chairman или member
   */
  private isBoardMember(currentUser?: MonoAccountDomainInterface): boolean {
    const role = currentUser?.role;
    return role === 'chairman' || role === 'member';
  }

  /**
   * Проверяет, имеет ли пользователь роль chairman
   * @param currentUser - текущий пользователь (может быть undefined для гостей)
   * @returns true если пользователь имеет роль chairman
   */
  private isChairman(currentUser?: MonoAccountDomainInterface): boolean {
    return currentUser?.role === 'chairman';
  }

  /**
   * Проверяет, является ли пользователь мастером проекта
   * @param username - имя пользователя
   * @param project - проект
   * @returns true если пользователь является мастером проекта
   */
  private isProjectMaster(username: string, project: ProjectDomainEntity): boolean {
    return project.master === username;
  }

  /**
   * Проверяет, является ли пользователь мастером проекта или связанного с ним компонента
   * @param username - имя пользователя
   * @param projectHash - хеш проекта
   * @returns true если пользователь является мастером
   */
  async isProjectOrComponentMaster(username: string, projectHash: string): Promise<boolean> {
    // Находим проект
    const project = await this.projectRepository.findByHash(projectHash);
    if (!project) {
      return false;
    }

    // Проверяем, является ли пользователь мастером текущего проекта
    if (project.master === username) {
      return true;
    }

    // Если у проекта есть родительский проект (т.е. это компонент),
    // проверяем, является ли пользователь мастером родительского проекта
    if (project.parent_hash) {
      const parentProject = await this.projectRepository.findByHash(project.parent_hash);
      if (parentProject && parentProject.master === username) {
        return true;
      }
    }

    return false;
  }

  /**
   * Проверяет, является ли пользователь подмастерьем задачи
   * @param username - имя пользователя
   * @param issueSubmaster - подмастерье задачи
   * @returns true если пользователь является подмастерьем задачи
   */
  private isIssueSubmaster(username: string, issueSubmaster?: string): boolean {
    return issueSubmaster === username;
  }

  /**
   * Проверяет, является ли пользователь вкладчиком проекта
   * @param username - имя пользователя (может быть undefined для гостей)
   * @param coopname - имя кооператива
   * @param projectHash - хеш проекта
   * @returns true если пользователь является вкладчиком проекта (имеет подтвержденное приложение)
   */
  private async isProjectContributor(username: string | undefined, coopname: string, projectHash: string): Promise<boolean> {
    // Если username не указан, пользователь не является вкладчиком
    if (!username) {
      return false;
    }

    // Проверяем наличие подтвержденного приложения для конкретного проекта
    const appendix = await this.appendixRepository.findConfirmedByUsernameAndProjectHash(username, projectHash);
    return appendix !== null;
  }

  /**
   * Рассчитывает права доступа пользователя к задаче
   * @param issue - задача
   * @param currentUser - текущий пользователь (может быть undefined для гостей)
   * @returns объект с флагами прав доступа
   */
  async calculateIssuePermissions(
    issue: IssueDomainEntity,
    currentUser?: MonoAccountDomainInterface
  ): Promise<IssuePermissionsOutputDTO> {
    // Для гостей (неавторизованных пользователей) все права false
    if (!currentUser?.username) {
      return {
        can_edit_issue: false,
        can_change_status: false,
        can_set_done: false,
        can_set_on_review: false,
        can_delete_issue: false,
      };
    }

    // Председатель совета и члены совета имеют полные права доступа ко всем задачам
    const isBoardMember = this.isBoardMember(currentUser);
    if (isBoardMember) {
      return {
        can_edit_issue: true,
        can_change_status: true,
        can_set_done: true,
        can_set_on_review: true,
        can_delete_issue: true,
      };
    }

    const username = currentUser.username;

    // Проверяем роль chairman
    const isChairman = this.isChairman(currentUser);

    // Проверяем, является ли пользователь мастером проекта или компонента
    const isMaster = await this.isProjectOrComponentMaster(username, issue.project_hash);

    // Проверяем, является ли пользователь подмастерьем задачи
    const isSubmaster = this.isIssueSubmaster(username, issue.submaster);

    // Проверяем, является ли пользователь участником проекта
    const isContributor = await this.isProjectContributor(username, issue.coopname, issue.project_hash);

    // Расчет прав:
    // can_edit_issue: мастер проекта/компонента или подмастерье задачи
    const can_edit_issue = isMaster || isSubmaster;

    // can_change_status: мастер, подмастерье или участник проекта
    const can_change_status = isMaster || isSubmaster || isContributor;

    // can_set_done: только мастер проекта/компонента
    const can_set_done = isMaster;

    // can_set_on_review: только подмастерье задачи
    const can_set_on_review = isSubmaster;

    // can_delete_issue: только chairman
    const can_delete_issue = isChairman;

    return {
      can_edit_issue,
      can_change_status,
      can_set_done,
      can_set_on_review,
      can_delete_issue,
    };
  }

  /**
   * Рассчитывает права доступа пользователя к проекту
   * @param project - проект
   * @param currentUser - текущий пользователь (может быть undefined для гостей)
   * @returns объект с флагами прав доступа
   */
  async calculateProjectPermissions(
    project: ProjectDomainEntity,
    currentUser?: MonoAccountDomainInterface
  ): Promise<ProjectPermissionsOutputDTO> {
    // Для гостей (неавторизованных пользователей) все права false
    if (!currentUser?.username) {
      return {
        can_edit_project: false,
        can_manage_issues: false,
        can_change_project_status: false,
        can_delete_project: false,
        can_set_master: false,
        can_manage_authors: false,
        can_set_plan: false,
      };
    }

    // Председатель совета и члены совета имеют полные права доступа ко всем проектам
    const isBoardMember = this.isBoardMember(currentUser);
    if (isBoardMember) {
      return {
        can_edit_project: true,
        can_manage_issues: true,
        can_change_project_status: true,
        can_delete_project: true,
        can_set_master: true,
        can_manage_authors: true,
        can_set_plan: true,
      };
    }

    const username = currentUser.username;

    // Проверяем роль chairman
    const isChairman = this.isChairman(currentUser);

    // Проверяем, является ли пользователь мастером проекта
    const isMaster = this.isProjectMaster(username, project);

    // Проверяем, является ли пользователь участником проекта
    // coopname может быть undefined, в таком случае пользователь не является участником
    const isContributor = project.coopname
      ? await this.isProjectContributor(username, project.coopname, project.project_hash)
      : false;

    // Расчет прав:
    // can_edit_project: только мастер проекта
    const can_edit_project = isMaster;

    // can_manage_issues: мастер или участник проекта
    const can_manage_issues = isMaster || isContributor;

    // can_change_project_status: только chairman
    const can_change_project_status = isChairman;

    // can_delete_project: только chairman
    const can_delete_project = isChairman;

    // can_set_master: только chairman
    const can_set_master = isChairman;

    // can_manage_authors: мастер проекта или chairman
    const can_manage_authors = isMaster || isChairman;

    // can_set_plan: только мастер проекта
    const can_set_plan = isMaster;

    return {
      can_edit_project,
      can_manage_issues,
      can_change_project_status,
      can_delete_project,
      can_set_master,
      can_manage_authors,
      can_set_plan,
    };
  }

  /**
   * Рассчитывает права доступа для массива задач
   * Оптимизирована для пакетной обработки
   * @param issues - массив задач
   * @param currentUser - текущий пользователь (может быть undefined для гостей)
   * @returns Map с правами доступа по хешу задачи
   */
  async calculateBatchIssuePermissions(
    issues: IssueDomainEntity[],
    currentUser?: MonoAccountDomainInterface
  ): Promise<Map<string, IssuePermissionsOutputDTO>> {
    const permissionsMap = new Map<string, IssuePermissionsOutputDTO>();

    // Для каждой задачи рассчитываем права доступа через основной метод
    for (const issue of issues) {
      const permissions = await this.calculateIssuePermissions(issue, currentUser);
      permissionsMap.set(issue.issue_hash, permissions);
    }

    return permissionsMap;
  }

  /**
   * Рассчитывает права доступа для массива проектов
   * Оптимизирована для пакетной обработки
   * @param projects - массив проектов
   * @param currentUser - текущий пользователь (может быть undefined для гостей)
   * @returns Map с правами доступа по хешу проекта
   */
  async calculateBatchProjectPermissions(
    projects: ProjectDomainEntity[],
    currentUser?: MonoAccountDomainInterface
  ): Promise<Map<string, ProjectPermissionsOutputDTO>> {
    const permissionsMap = new Map<string, ProjectPermissionsOutputDTO>();

    // Для каждого проекта рассчитываем права доступа через основной метод
    for (const project of projects) {
      const permissions = await this.calculateProjectPermissions(project, currentUser);
      permissionsMap.set(project.project_hash, permissions);
    }

    return permissionsMap;
  }
}
