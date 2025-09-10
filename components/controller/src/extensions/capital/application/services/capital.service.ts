import { Injectable } from '@nestjs/common';
import { ContractManagementInteractor } from '../../domain/interactors/contract-management.interactor';
import { ParticipationManagementInteractor } from '../../domain/interactors/participation-management.interactor';
import { ProjectManagementInteractor } from '../../domain/interactors/project-management.interactor';
import { GenerationInteractor } from '../../domain/interactors/generation.interactor';
import { InvestsManagementInteractor } from '../../domain/interactors/invests-management.interactor';
import { DebtManagementInteractor } from '../../domain/interactors/debt-management.interactor';
import { PropertyManagementInteractor } from '../../domain/interactors/property-management.interactor';
import { VotingInteractor } from '../../domain/interactors/voting.interactor';
import { ResultSubmissionInteractor } from '../../domain/interactors/result-submission.interactor';
import { DistributionManagementInteractor } from '../../domain/interactors/distribution-management.interactor';

import type { SetConfigInputDTO } from '../dto/contract_management';
import type { CreateProjectInputDTO } from '../dto/project_management';
import type { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import type { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';
import type { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import type {
  SetMasterInputDTO,
  AddAuthorInputDTO,
  SetPlanInputDTO,
  StartProjectInputDTO,
  OpenProjectInputDTO,
  DeleteProjectInputDTO,
} from '../dto/project_management';
import type { TransactResult } from '@wharfkit/session';
import type { CreateDebtInputDTO } from '../dto/debt_management/create-debt-input.dto';
import type { FundProgramInputDTO } from '../dto/distribution_management/fund-program-input.dto';
import type { FundProjectInputDTO } from '../dto/distribution_management/fund-project-input.dto';
import type { RefreshProgramInputDTO } from '../dto/distribution_management/refresh-program-input.dto';
import type { RefreshProjectInputDTO } from '../dto/distribution_management/refresh-project-input.dto';
import type { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import type { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import type { CreateProjectInvestInputDTO } from '../dto/invests_management/create-project-invest-input.dto';
import type { CreateProgramPropertyInputDTO } from '../dto/property_management/create-program-property-input.dto';
import type { CreateProjectPropertyInputDTO } from '../dto/property_management/create-project-property-input.dto';
import type { ConvertSegmentInputDTO } from '../dto/result_submission/convert-segment-input.dto';
import type { PushResultInputDTO } from '../dto/result_submission/push-result-input.dto';
import type { CalculateVotesInputDTO } from '../dto/voting/calculate-votes-input.dto';
import type { CompleteVotingInputDTO } from '../dto/voting/complete-voting-input.dto';
import type { StartVotingInputDTO } from '../dto/voting/start-voting-input.dto';
import type { SubmitVoteInputDTO } from '../dto/voting/submit-vote-input.dto';

/**
 * Сервис уровня приложения для CAPITAL контракта
 * Осуществляет оркестрацию между резолверами и доменным слоем
 */
@Injectable()
export class CapitalService {
  constructor(
    private readonly contractManagementInteractor: ContractManagementInteractor,
    private readonly participationManagementInteractor: ParticipationManagementInteractor,
    private readonly projectManagementInteractor: ProjectManagementInteractor,
    private readonly generationInteractor: GenerationInteractor,
    private readonly investsManagementInteractor: InvestsManagementInteractor,
    private readonly debtManagementInteractor: DebtManagementInteractor,
    private readonly propertyManagementInteractor: PropertyManagementInteractor,
    private readonly votingInteractor: VotingInteractor,
    private readonly resultSubmissionInteractor: ResultSubmissionInteractor,
    private readonly distributionManagementInteractor: DistributionManagementInteractor
  ) {}

  /**
   * Установка конфигурации CAPITAL контракта
   */
  async setConfig(data: SetConfigInputDTO): Promise<TransactResult> {
    return await this.contractManagementInteractor.setConfig(data);
  }

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  async importContributor(data: ImportContributorInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.importContributor(data);
  }

  /**
   * Создание проекта в CAPITAL контракте
   */
  async createProject(data: CreateProjectInputDTO): Promise<TransactResult> {
    return await this.projectManagementInteractor.createProject(data);
  }

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.registerContributor(data);
  }

  /**
   * Подписание приложения в CAPITAL контракте
   */
  async makeClearance(data: MakeClearanceInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.makeClearance(data);
  }

  /**
   * Создание коммита в CAPITAL контракте
   */
  async createCommit(data: CreateCommitInputDTO): Promise<TransactResult> {
    return await this.generationInteractor.createCommit(data);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentInputDTO): Promise<TransactResult> {
    return await this.generationInteractor.refreshSegment(data);
  }

  /**
   * Инвестирование в проект CAPITAL контракта
   */
  async createProjectInvest(data: CreateProjectInvestInputDTO): Promise<TransactResult> {
    return await this.investsManagementInteractor.createProjectInvest(data);
  }

  /**
   * Создание долга в CAPITAL контракте
   */
  async createDebt(data: CreateDebtInputDTO): Promise<TransactResult> {
    return await this.debtManagementInteractor.createDebt(data);
  }

  /**
   * Создание проектного имущественного взноса в CAPITAL контракте
   */
  async createProjectProperty(data: CreateProjectPropertyInputDTO): Promise<TransactResult> {
    return await this.propertyManagementInteractor.createProjectProperty(data);
  }

  /**
   * Создание программного имущественного взноса в CAPITAL контракте
   */
  async createProgramProperty(data: CreateProgramPropertyInputDTO): Promise<TransactResult> {
    return await this.propertyManagementInteractor.createProgramProperty(data);
  }

  /**
   * Запуск голосования в CAPITAL контракте
   */
  async startVoting(data: StartVotingInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.startVoting(data);
  }

  /**
   * Голосование в CAPITAL контракте
   */
  async submitVote(data: SubmitVoteInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.submitVote(data);
  }

  /**
   * Завершение голосования в CAPITAL контракте
   */
  async completeVoting(data: CompleteVotingInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.completeVoting(data);
  }

  /**
   * Расчет голосов в CAPITAL контракте
   */
  async calculateVotes(data: CalculateVotesInputDTO): Promise<TransactResult> {
    return await this.votingInteractor.calculateVotes(data);
  }

  /**
   * Внесение результата в CAPITAL контракте
   */
  async pushResult(data: PushResultInputDTO): Promise<TransactResult> {
    return await this.resultSubmissionInteractor.pushResult(data);
  }

  /**
   * Конвертация сегмента в CAPITAL контракте
   */
  async convertSegment(data: ConvertSegmentInputDTO): Promise<TransactResult> {
    return await this.resultSubmissionInteractor.convertSegment(data);
  }

  /**
   * Финансирование программы в CAPITAL контракте
   */
  async fundProgram(data: FundProgramInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.fundProgram(data);
  }

  /**
   * Финансирование проекта в CAPITAL контракте
   */
  async fundProject(data: FundProjectInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.fundProject(data);
  }

  /**
   * Обновление CRPS пайщика в программе CAPITAL контракта
   */
  async refreshProgram(data: RefreshProgramInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.refreshProgram(data);
  }

  /**
   * Обновление CRPS пайщика в проекте CAPITAL контракта
   */
  async refreshProject(data: RefreshProjectInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.refreshProject(data);
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
}
