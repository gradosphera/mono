import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import type { TransactResult } from '@wharfkit/session';
import type { CreateProjectDomainInput } from '../../domain/actions/create-project-domain-input.interface';
import type { AddAuthorDomainInput } from '../../domain/actions/add-author-domain-input.interface';
import type { DeleteProjectDomainInput } from '../../domain/actions/delete-project-domain-input.interface';
import type { OpenProjectDomainInput } from '../../domain/actions/open-project-domain-input.interface';
import type { SetMasterDomainInput } from '../../domain/actions/set-master-domain-input.interface';
import type { SetPlanDomainInput } from '../../domain/actions/set-plan-domain-input.interface';
import type { StartProjectDomainInput } from '../../domain/actions/start-project-domain-input.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { ProjectFilterInputDTO } from '../dto/property_management/project-filter.input';

/**
 * Интерактор домена для управления проектами CAPITAL контракта
 * Обрабатывает действия связанные с управлением жизненным циклом проектов
 */
@Injectable()
export class ProjectManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository
  ) {}
  /**
   * Создание проекта в CAPITAL контракте
   */
  async createProject(data: CreateProjectDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createProject(data);
  }
  /**
   * Установка мастера проекта CAPITAL контракта
   */
  async setMaster(data: SetMasterDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.setMaster(data);
  }

  /**
   * Добавление автора проекта CAPITAL контракта
   */
  async addAuthor(data: AddAuthorDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.addAuthor(data);
  }

  /**
   * Установка плана проекта CAPITAL контракта
   */
  async setPlan(data: SetPlanDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.setPlan(data);
  }

  /**
   * Запуск проекта CAPITAL контракта
   */
  async startProject(data: StartProjectDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.startProject(data);
  }

  /**
   * Открытие проекта для инвестиций CAPITAL контракта
   */
  async openProject(data: OpenProjectDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.openProject(data);
  }

  /**
   * Удаление проекта CAPITAL контракта
   */
  async deleteProject(data: DeleteProjectDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.deleteProject(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех проектов с фильтрацией и пагинацией
   */
  async getProjects(
    filter?: ProjectFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ProjectDomainEntity>> {
    return await this.projectRepository.findAllPaginated(filter, options);
  }

  /**
   * Получение проекта по внутреннему ID базы данных
   */
  async getProjectById(_id: string): Promise<ProjectDomainEntity | null> {
    return await this.projectRepository.findById(_id);
  }

  /**
   * Получение проекта со всеми связанными данными по хешу проекта
   */
  async getProjectWithRelations(projectHash: string): Promise<ProjectDomainEntity | null> {
    return await this.projectRepository.findByIdWithAllRelations(projectHash);
  }
}
