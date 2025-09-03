import { CapitalContract } from 'cooptypes';
import { ProjectStatus } from '../interfaces/project.entity';

// Типы из блокчейн контракта
type IProject = CapitalContract.Tables.Projects.IProject;
type BlockchainProjectId = IProject['id'];
type ProjectCounts = IProject['counts'];
type ProjectPlan = IProject['plan'];
type ProjectFact = IProject['fact'];
type ProjectCrps = IProject['crps'];
type ProjectVoting = IProject['voting'];
type ProjectMembership = IProject['membership'];

/**
 * Доменная сущность проекта
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные проекта из таблицы projects
 */
export class ProjectDomainEntity {
  // Поля из базы данных
  public readonly id: string; // Внутренний ID базы данных
  public readonly blockchainId: BlockchainProjectId; // ID в блокчейне

  // Доменные поля (расширения)
  public readonly status: ProjectStatus;

  // Поля из блокчейна (projects.hpp)
  public readonly coopname: IProject['coopname'];
  public readonly project_hash: IProject['project_hash'];
  public readonly parent_hash: IProject['parent_hash'];
  public readonly blockchainStatus: IProject['status']; // Статус из блокчейна
  public readonly is_opened: IProject['is_opened'];
  public readonly is_planed: IProject['is_planed'];
  public readonly can_convert_to_project: IProject['can_convert_to_project'];
  public readonly master: IProject['master'];
  public readonly title: IProject['title'];
  public readonly description: IProject['description'];
  public readonly meta: IProject['meta'];
  public readonly counts: ProjectCounts;
  public readonly plan: ProjectPlan;
  public readonly fact: ProjectFact;
  public readonly crps: ProjectCrps;
  public readonly voting: ProjectVoting;
  public readonly membership: ProjectMembership;
  public readonly created_at: IProject['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   * @param domainData - доменные данные
   */
  constructor(
    databaseData: {
      id: string;
      blockchainId: BlockchainProjectId;
    },
    blockchainData: IProject
  ) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchainId = databaseData.blockchainId;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.project_hash = blockchainData.project_hash;
    this.parent_hash = blockchainData.parent_hash;
    this.blockchainStatus = blockchainData.status;
    this.is_opened = blockchainData.is_opened;
    this.is_planed = blockchainData.is_planed;
    this.can_convert_to_project = blockchainData.can_convert_to_project;
    this.master = blockchainData.master;
    this.title = blockchainData.title;
    this.description = blockchainData.description;
    this.meta = blockchainData.meta;
    this.counts = blockchainData.counts;
    this.plan = blockchainData.plan;
    this.fact = blockchainData.fact;
    this.crps = blockchainData.crps;
    this.voting = blockchainData.voting;
    this.membership = blockchainData.membership;
    this.created_at = blockchainData.created_at;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }
  /**
   * Возвращает полное представление сущности для сериализации
   */
  public toJSON(): {
    // Данные из базы данных
    id: string;
    blockchainId: BlockchainProjectId;

    // Данные из блокчейна
    coopname: IProject['coopname'];
    project_hash: IProject['project_hash'];
    parent_hash: IProject['parent_hash'];
    blockchainStatus: IProject['status'];
    is_opened: IProject['is_opened'];
    is_planed: IProject['is_planed'];
    can_convert_to_project: IProject['can_convert_to_project'];
    master: IProject['master'];
    title: IProject['title'];
    description: IProject['description'];
    meta: IProject['meta'];
    counts: ProjectCounts;
    plan: ProjectPlan;
    fact: ProjectFact;
    crps: ProjectCrps;
    voting: ProjectVoting;
    membership: ProjectMembership;
    created_at: IProject['created_at'];

    // Доменные данные
    status: ProjectStatus;
  } {
    return {
      // Данные из базы данных
      id: this.id,
      blockchainId: this.blockchainId,

      // Данные из блокчейна
      coopname: this.coopname,
      project_hash: this.project_hash,
      parent_hash: this.parent_hash,
      blockchainStatus: this.blockchainStatus,
      is_opened: this.is_opened,
      is_planed: this.is_planed,
      can_convert_to_project: this.can_convert_to_project,
      master: this.master,
      title: this.title,
      description: this.description,
      meta: this.meta,
      counts: this.counts,
      plan: this.plan,
      fact: this.fact,
      crps: this.crps,
      voting: this.voting,
      membership: this.membership,
      created_at: this.created_at,

      // Доменные данные
      status: this.status,
    };
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из projects.hpp
   */
  private mapBlockchainStatusToDomain(blockchainStatus: IProject['status']): ProjectStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending':
        return ProjectStatus.PENDING;
      case 'active':
        return ProjectStatus.ACTIVE;
      case 'voting':
        return ProjectStatus.VOTING;
      case 'completed':
        return ProjectStatus.COMPLETED;
      case 'closed':
        return ProjectStatus.CLOSED;
      default:
        // По умолчанию считаем проект закрытым для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CLOSED`);
        return ProjectStatus.CLOSED;
    }
  }
}
