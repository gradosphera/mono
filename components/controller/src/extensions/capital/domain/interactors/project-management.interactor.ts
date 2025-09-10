import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { CreateProjectDomainInput } from '../actions/create-project-domain-input.interface';
import type { AddAuthorDomainInput } from '../actions/add-author-domain-input.interface';
import type { DeleteProjectDomainInput } from '../actions/delete-project-domain-input.interface';
import type { OpenProjectDomainInput } from '../actions/open-project-domain-input.interface';
import type { SetMasterDomainInput } from '../actions/set-master-domain-input.interface';
import type { SetPlanDomainInput } from '../actions/set-plan-domain-input.interface';
import type { StartProjectDomainInput } from '../actions/start-project-domain-input.interface';

/**
 * Интерактор домена для управления проектами CAPITAL контракта
 * Обрабатывает действия связанные с управлением жизненным циклом проектов
 */
@Injectable()
export class ProjectManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}
  /**
   * Создание проекта в CAPITAL контракте
   */
  async createProject(data: CreateProjectDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CreateProject.ICreateProject = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      parent_hash: data.parent_hash,
      title: data.title,
      description: data.description,
      meta: data.meta,
      can_convert_to_project: data.can_convert_to_project,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createProject(blockchainData);
  }
  /**
   * Установка мастера проекта CAPITAL контракта
   */
  async setMaster(data: SetMasterDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.SetMaster.ISetMaster = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      master: data.master,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.setMaster(blockchainData);
  }

  /**
   * Добавление автора проекта CAPITAL контракта
   */
  async addAuthor(data: AddAuthorDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.AddAuthor.IAddAuthor = {
      coopname: data.coopname,
      project_hash: data.project_hash,
      author: data.author,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.addAuthor(blockchainData);
  }

  /**
   * Установка плана проекта CAPITAL контракта
   */
  async setPlan(data: SetPlanDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.SetPlan.ISetPlan = {
      coopname: data.coopname,
      master: data.master,
      project_hash: data.project_hash,
      plan_creators_hours: data.plan_creators_hours,
      plan_expenses: data.plan_expenses,
      plan_hour_cost: data.plan_hour_cost,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.setPlan(blockchainData);
  }

  /**
   * Запуск проекта CAPITAL контракта
   */
  async startProject(data: StartProjectDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.StartProject.IStartProject = {
      coopname: data.coopname,
      project_hash: data.project_hash,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.startProject(blockchainData);
  }

  /**
   * Открытие проекта для инвестиций CAPITAL контракта
   */
  async openProject(data: OpenProjectDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.OpenProject.IOpenProject = {
      coopname: data.coopname,
      project_hash: data.project_hash,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.openProject(blockchainData);
  }

  /**
   * Удаление проекта CAPITAL контракта
   */
  async deleteProject(data: DeleteProjectDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.DeleteProject.IDeleteProject = {
      coopname: data.coopname,
      project_hash: data.project_hash,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.deleteProject(blockchainData);
  }
}
