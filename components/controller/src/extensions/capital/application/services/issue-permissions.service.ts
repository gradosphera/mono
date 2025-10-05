import { Injectable, Inject } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../../domain/repositories/contributor.repository';
import { IssueStatus } from '../../domain/enums/issue-status.enum';

/**
 * Сервис для проверки прав доступа к задачам
 * Содержит переиспользуемые функции для валидации прав на изменение статусов задач
 */
@Injectable()
export class IssuePermissionsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository
  ) {}

  /**
   * Проверяет, является ли пользователь мастером проекта или связанного с ним компонента
   * @param username - имя пользователя
   * @param coopname - имя кооператива
   * @param projectHash - хеш проекта
   * @returns true, если пользователь является мастером
   */
  async isProjectMaster(username: string, coopname: string, projectHash: string): Promise<boolean> {
    // Находим проект
    const project = await this.projectRepository.findByHash(projectHash);
    if (!project) {
      throw new Error(`Проект с хэшем ${projectHash} не найден`);
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
   * @returns true, если пользователь является подмастерьем задачи
   */
  isIssueSubmaster(username: string, issueSubmaster?: string): boolean {
    return issueSubmaster === username;
  }

  /**
   * Проверяет права на установку статуса DONE для задачи
   * Только мастер проекта или компонента может устанавливать статус DONE
   * @param username - имя пользователя
   * @param coopname - имя кооператива
   * @param projectHash - хеш проекта задачи
   * @param newStatus - новый статус задачи
   * @param currentStatus - текущий статус задачи (опционально, для обновления)
   */
  async validateDoneStatusPermission(
    username: string,
    coopname: string,
    projectHash: string,
    newStatus: IssueStatus,
    currentStatus?: IssueStatus
  ): Promise<void> {
    // Проверяем только если статус меняется на DONE или уже является DONE
    if (newStatus === IssueStatus.DONE || currentStatus === IssueStatus.DONE) {
      const isMaster = await this.isProjectMaster(username, coopname, projectHash);
      if (!isMaster) {
        throw new Error('Только мастер проекта или связанного с ним компонента может устанавливать статус "Выполнена"');
      }
    }
  }

  /**
   * Проверяет права на установку статуса ON_REVIEW для задачи
   * Только подмастерье задачи может устанавливать статус ON_REVIEW
   * @param username - имя пользователя
   * @param issueSubmaster - подмастерье задачи
   * @param newStatus - новый статус задачи
   * @param currentStatus - текущий статус задачи (опционально, для обновления)
   */
  validateOnReviewStatusPermission(
    username: string,
    issueSubmaster: string | undefined,
    newStatus: IssueStatus,
    currentStatus?: IssueStatus
  ): void {
    // Проверяем только если статус меняется на ON_REVIEW или уже является ON_REVIEW
    if (newStatus === IssueStatus.ON_REVIEW || currentStatus === IssueStatus.ON_REVIEW) {
      const isSubmaster = this.isIssueSubmaster(username, issueSubmaster);
      if (!isSubmaster) {
        throw new Error('Только подмастерье задачи может устанавливать статус "На проверке"');
      }
    }
  }

  /**
   * Комплексная проверка прав на изменение статуса задачи
   * Мастер проекта может устанавливать любые статусы
   * Подмастерье может устанавливать любые статусы кроме DONE
   * Только мастер может закрывать задачи (статус DONE)
   * @param username - имя пользователя
   * @param coopname - имя кооператива
   * @param projectHash - хеш проекта задачи
   * @param issueSubmaster - подмастерье задачи
   * @param newStatus - новый статус задачи
   * @param currentStatus - текущий статус задачи (опционально, для обновления)
   */
  async validateIssueStatusPermission(
    username: string,
    coopname: string,
    projectHash: string,
    issueSubmaster: string | undefined,
    newStatus: IssueStatus,
    currentStatus?: IssueStatus
  ): Promise<void> {
    // Сначала проверяем, является ли пользователь мастером проекта
    const isMaster = await this.isProjectMaster(username, coopname, projectHash);

    // Если пользователь - мастер, он может устанавливать любые статусы
    if (isMaster) {
      return;
    }

    // Если пользователь не мастер, проверяем специальные правила

    // Для статуса DONE - только мастер может закрывать задачи
    if (newStatus === IssueStatus.DONE || currentStatus === IssueStatus.DONE) {
      throw new Error('Только мастер проекта или связанного с ним компонента может устанавливать статус "Выполнена"');
    }

    // Все остальные статусы (BACKLOG, TODO, IN_PROGRESS, ON_REVIEW, CANCELED)
    // могут устанавливать все пользователи с доступом к проекту
  }
}
