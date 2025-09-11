import { Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import { CapitalDatabaseModule } from './infrastructure/database/capital-database.module';
import { EventsInfrastructureModule } from '~/infrastructure/events/events.module';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

// Репозитории
import { ProjectTypeormRepository } from './infrastructure/repositories/project.typeorm-repository';
import { ContributorTypeormRepository } from './infrastructure/repositories/contributor.typeorm-repository';
import { AppendixTypeormRepository } from './infrastructure/repositories/appendix.typeorm-repository';
import { InvestTypeormRepository } from './infrastructure/repositories/invest.typeorm-repository';
import { ProgramInvestTypeormRepository } from './infrastructure/repositories/program-invest.typeorm-repository';
import { ProgramPropertyTypeormRepository } from './infrastructure/repositories/program-property.typeorm-repository';
import { ProgramWithdrawTypeormRepository } from './infrastructure/repositories/program-withdraw.typeorm-repository';
import { ProjectPropertyTypeormRepository } from './infrastructure/repositories/project-property.typeorm-repository';
import { ProgramWalletTypeormRepository } from './infrastructure/repositories/program-wallet.typeorm-repository';
import { ProjectWalletTypeormRepository } from './infrastructure/repositories/project-wallet.typeorm-repository';
import { CycleTypeormRepository } from './infrastructure/repositories/cycle.typeorm-repository';
import { IssueTypeormRepository } from './infrastructure/repositories/issue.typeorm-repository';
import { CommentTypeormRepository } from './infrastructure/repositories/comment.typeorm-repository';
import { StoryTypeormRepository } from './infrastructure/repositories/story.typeorm-repository';
import { VoteTypeormRepository } from './infrastructure/repositories/vote.typeorm-repository';
import { DebtTypeormRepository } from './infrastructure/repositories/debt.typeorm-repository';
import { ResultTypeormRepository } from './infrastructure/repositories/result.typeorm-repository';
import { ExpenseTypeormRepository } from './infrastructure/repositories/expense.typeorm-repository';
import { CommitTypeormRepository } from './infrastructure/repositories/commit.typeorm-repository';
import { StateTypeormRepository } from './infrastructure/repositories/state.typeorm-repository';

// Blockchain синхронизация
import { ProjectDeltaMapper } from './infrastructure/blockchain/mappers/project-delta.mapper';
import { ProjectSyncService } from './infrastructure/blockchain/services/project-sync.service';
import { ContributorDeltaMapper } from './infrastructure/blockchain/mappers/contributor-delta.mapper';
import { ContributorSyncService } from './infrastructure/blockchain/services/contributor-sync.service';
import { AppendixDeltaMapper } from './infrastructure/blockchain/mappers/appendix-delta.mapper';
import { AppendixSyncService } from './infrastructure/blockchain/services/appendix-sync.service';
import { ProgramInvestDeltaMapper } from './infrastructure/blockchain/mappers/program-invest-delta.mapper';
import { ProgramInvestSyncService } from './infrastructure/blockchain/services/program-invest-sync.service';
import { ProgramPropertyDeltaMapper } from './infrastructure/blockchain/mappers/program-property-delta.mapper';
import { ProgramPropertySyncService } from './infrastructure/blockchain/services/program-property-sync.service';
import { ProgramWithdrawDeltaMapper } from './infrastructure/blockchain/mappers/program-withdraw-delta.mapper';
import { ProgramWithdrawSyncService } from './infrastructure/blockchain/services/program-withdraw-sync.service';
import { ProjectPropertyDeltaMapper } from './infrastructure/blockchain/mappers/project-property-delta.mapper';
import { ProjectPropertySyncService } from './infrastructure/blockchain/services/project-property-sync.service';
import { ProgramWalletDeltaMapper } from './infrastructure/blockchain/mappers/program-wallet-delta.mapper';
import { ProgramWalletSyncService } from './infrastructure/blockchain/services/program-wallet-sync.service';
import { ProjectWalletDeltaMapper } from './infrastructure/blockchain/mappers/project-wallet-delta.mapper';
import { ProjectWalletSyncService } from './infrastructure/blockchain/services/project-wallet-sync.service';
import { CapitalSyncInteractor } from './domain/interactors/capital-sync.interactor';

// Services
import { CapitalContractInfoService } from './infrastructure/services/capital-contract-info.service';
import { ContractManagementService } from './application/services/contract-management.service';
import { ParticipationManagementService } from './application/services/participation-management.service';
import { ProjectManagementService } from './application/services/project-management.service';
import { GenerationService } from './application/services/generation.service';
import { InvestsManagementService } from './application/services/invests-management.service';
import { DebtManagementService } from './application/services/debt-management.service';
import { PropertyManagementService } from './application/services/property-management.service';
import { VotingService } from './application/services/voting.service';
import { ResultSubmissionService } from './application/services/result-submission.service';
import { DistributionManagementService } from './application/services/distribution-management.service';
import { ExpensesManagementService } from './application/services/expenses-management.service';

// CAPITAL Application Dependencies
import { CapitalBlockchainAdapter } from './infrastructure/blockchain/adapters/capital-blockchain.adapter';
import { CAPITAL_BLOCKCHAIN_PORT } from './domain/interfaces/capital-blockchain.port';

// Символы для DI
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY } from './domain/repositories/contributor.repository';
import { APPENDIX_REPOSITORY } from './domain/repositories/appendix.repository';
import { INVEST_REPOSITORY } from './domain/repositories/invest.repository';
import { PROGRAM_INVEST_REPOSITORY } from './domain/repositories/program-invest.repository';
import { PROGRAM_PROPERTY_REPOSITORY } from './domain/repositories/program-property.repository';
import { PROGRAM_WITHDRAW_REPOSITORY } from './domain/repositories/program-withdraw.repository';
import { PROJECT_PROPERTY_REPOSITORY } from './domain/repositories/project-property.repository';
import { PROGRAM_WALLET_REPOSITORY } from './domain/repositories/program-wallet.repository';
import { PROJECT_WALLET_REPOSITORY } from './domain/repositories/project-wallet.repository';
import { CYCLE_REPOSITORY } from './domain/repositories/cycle.repository';
import { ISSUE_REPOSITORY } from './domain/repositories/issue.repository';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { STORY_REPOSITORY } from './domain/repositories/story.repository';
import { VOTE_REPOSITORY } from './domain/repositories/vote.repository';
import { DEBT_REPOSITORY } from './domain/repositories/debt.repository';
import { RESULT_REPOSITORY } from './domain/repositories/result.repository';
import { EXPENSE_REPOSITORY } from './domain/repositories/expense.repository';
import { COMMIT_REPOSITORY } from './domain/repositories/commit.repository';
import { STATE_REPOSITORY } from './domain/repositories/state.repository';

import { z } from 'zod';

import { ContractManagementResolver } from './application/resolvers/contract-management.resolver';
import { ParticipationManagementResolver } from './application/resolvers/participation-management.resolver';
import { ProjectManagementResolver } from './application/resolvers/project-management.resolver';
import { GenerationResolver } from './application/resolvers/generation.resolver';
import { InvestsManagementResolver } from './application/resolvers/invests-management.resolver';
import { DebtManagementResolver } from './application/resolvers/debt-management.resolver';
import { PropertyManagementResolver } from './application/resolvers/property-management.resolver';
import { VotingResolver } from './application/resolvers/voting.resolver';
import { ResultSubmissionResolver } from './application/resolvers/result-submission.resolver';
import { DistributionManagementResolver } from './application/resolvers/distribution-management.resolver';
import { ExpensesManagementResolver } from './application/resolvers/expenses-management.resolver';

import { ParticipationManagementInteractor } from './domain/interactors/participation-management.interactor';
import { ProjectManagementInteractor } from './domain/interactors/project-management.interactor';
import { GenerationInteractor } from './domain/interactors/generation.interactor';
import { InvestsManagementInteractor } from './domain/interactors/invests-management.interactor';
import { DebtManagementInteractor } from './domain/interactors/debt-management.interactor';
import { PropertyManagementInteractor } from './domain/interactors/property-management.interactor';
import { VotingInteractor } from './domain/interactors/voting.interactor';
import { ResultSubmissionInteractor } from './domain/interactors/result-submission.interactor';
import { DistributionManagementInteractor } from './domain/interactors/distribution-management.interactor';
import { ContractManagementInteractor } from './domain/interactors/contract-management.interactor';
import { ExpensesManagementInteractor } from './domain/interactors/expenses-management.interactor';

// Конфигурация модуля
interface ICapitalConfig {
  defaultHourCost: number;
  coordinatorPercent: number;
  authorPercent: number;
}

const defaultConfig: ICapitalConfig = {
  defaultHourCost: 2000,
  coordinatorPercent: 4,
  authorPercent: 61.8,
};

export const Schema = z.object({
  defaultHourCost: z.number().min(0),
  coordinatorPercent: z.number().min(0).max(100),
  authorPercent: z.number().min(0).max(100),
});

@Injectable()
export class CapitalPlugin extends BaseExtModule {
  constructor(private readonly logger: WinstonLoggerService, private readonly syncInteractor: CapitalSyncInteractor) {
    super();
    this.logger.setContext(CapitalPlugin.name);
  }

  name = 'capital';
  plugin!: any; // ExtensionDomainEntity<ICapitalConfig>;

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  async initialize(): Promise<void> {
    this.logger.log('Capital module initialized');

    // Инициализируем синхронизацию с блокчейном
    try {
      await this.syncInteractor.initializeSync();
      this.logger.log('Capital blockchain sync initialized');
    } catch (error: any) {
      this.logger.error(`Failed to initialize Capital blockchain sync: ${error.message}`, error.stack);
      // Не бросаем ошибку, чтобы не блокировать запуск модуля
    }
  }
}

@Module({
  imports: [CapitalDatabaseModule, EventsInfrastructureModule],
  providers: [
    // Plugin
    CapitalPlugin,

    // Services
    CapitalContractInfoService,
    ContractManagementService,
    ParticipationManagementService,
    ProjectManagementService,
    GenerationService,
    InvestsManagementService,
    DebtManagementService,
    PropertyManagementService,
    VotingService,
    ResultSubmissionService,
    DistributionManagementService,
    ExpensesManagementService,

    // CAPITAL Application Layer Dependencies
    {
      provide: CAPITAL_BLOCKCHAIN_PORT,
      useClass: CapitalBlockchainAdapter,
    },

    // Blockchain Sync Services
    ProjectDeltaMapper,
    ProjectSyncService,
    ContributorDeltaMapper,
    ContributorSyncService,
    AppendixDeltaMapper,
    AppendixSyncService,
    ProgramInvestDeltaMapper,
    ProgramInvestSyncService,
    ProgramPropertyDeltaMapper,
    ProgramPropertySyncService,
    ProgramWithdrawDeltaMapper,
    ProgramWithdrawSyncService,
    ProjectPropertyDeltaMapper,
    ProjectPropertySyncService,
    ProgramWalletDeltaMapper,
    ProgramWalletSyncService,
    ProjectWalletDeltaMapper,
    ProjectWalletSyncService,
    ContractManagementResolver,
    ParticipationManagementResolver,
    ProjectManagementResolver,
    GenerationResolver,
    InvestsManagementResolver,
    DebtManagementResolver,
    PropertyManagementResolver,
    VotingResolver,
    ResultSubmissionResolver,
    DistributionManagementResolver,
    ExpensesManagementResolver,
    // Domain Interactors
    ContractManagementInteractor,
    ParticipationManagementInteractor,
    ProjectManagementInteractor,
    GenerationInteractor,
    InvestsManagementInteractor,
    DebtManagementInteractor,
    PropertyManagementInteractor,
    VotingInteractor,
    ResultSubmissionInteractor,
    DistributionManagementInteractor,
    ExpensesManagementInteractor,
    CapitalSyncInteractor,

    // Repositories
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectTypeormRepository,
    },
    {
      provide: CONTRIBUTOR_REPOSITORY,
      useClass: ContributorTypeormRepository,
    },
    {
      provide: APPENDIX_REPOSITORY,
      useClass: AppendixTypeormRepository,
    },
    {
      provide: INVEST_REPOSITORY,
      useClass: InvestTypeormRepository,
    },
    {
      provide: PROGRAM_INVEST_REPOSITORY,
      useClass: ProgramInvestTypeormRepository,
    },
    {
      provide: PROGRAM_PROPERTY_REPOSITORY,
      useClass: ProgramPropertyTypeormRepository,
    },
    {
      provide: PROGRAM_WITHDRAW_REPOSITORY,
      useClass: ProgramWithdrawTypeormRepository,
    },
    {
      provide: PROJECT_PROPERTY_REPOSITORY,
      useClass: ProjectPropertyTypeormRepository,
    },
    {
      provide: PROGRAM_WALLET_REPOSITORY,
      useClass: ProgramWalletTypeormRepository,
    },
    {
      provide: PROJECT_WALLET_REPOSITORY,
      useClass: ProjectWalletTypeormRepository,
    },
    {
      provide: CYCLE_REPOSITORY,
      useClass: CycleTypeormRepository,
    },
    {
      provide: ISSUE_REPOSITORY,
      useClass: IssueTypeormRepository,
    },
    {
      provide: COMMENT_REPOSITORY,
      useClass: CommentTypeormRepository,
    },
    {
      provide: STORY_REPOSITORY,
      useClass: StoryTypeormRepository,
    },
    {
      provide: VOTE_REPOSITORY,
      useClass: VoteTypeormRepository,
    },
    {
      provide: DEBT_REPOSITORY,
      useClass: DebtTypeormRepository,
    },
    {
      provide: RESULT_REPOSITORY,
      useClass: ResultTypeormRepository,
    },
    {
      provide: EXPENSE_REPOSITORY,
      useClass: ExpenseTypeormRepository,
    },
    {
      provide: COMMIT_REPOSITORY,
      useClass: CommitTypeormRepository,
    },
    {
      provide: STATE_REPOSITORY,
      useClass: StateTypeormRepository,
    },
  ],
  exports: [CapitalPlugin],
})
export class CapitalPluginModule {
  constructor(private readonly capitalPlugin: CapitalPlugin) {}

  async initialize() {
    await this.capitalPlugin.initialize();
  }
}
