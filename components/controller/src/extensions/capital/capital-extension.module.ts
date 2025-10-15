import { Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import { CapitalDatabaseModule } from './infrastructure/database/capital-database.module';
import { EventsInfrastructureModule } from '~/infrastructure/events/events.module';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { ExtensionPortsModule } from '~/domain/extension/extension-ports.module';
import type { DeserializedDescriptionOfExtension } from '~/types/shared';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { Inject } from '@nestjs/common';
import { z } from 'zod';

// Функция для проверки и сериализации FieldDescription
function describeField(description: DeserializedDescriptionOfExtension): string {
  return JSON.stringify(description);
}

// Дефолтные параметры конфигурации
export const defaultConfig = {
  authors_voting_percent: 38.2,
  coordinator_bonus_percent: 5,
  coordinator_invite_validity_days: 30,
  creators_voting_percent: 38.2,
  expense_pool_percent: 100,
  voting_period_in_days: 2,
} as const;

// Определение Zod-схемы
export const Schema = z.object({
  authors_voting_percent: z
    .number()
    .default(defaultConfig.authors_voting_percent)
    .describe(
      describeField({
        label: 'Процент пула премий авторов',
        note: 'Процент от общего числа голосов, который автоматически выделяется авторам предложений при голосовании. Это обеспечивает авторам базовый уровень влияния на принятие решений.',
        rules: ['val >= 0', 'val <= 100'],
        prepend: '%',
      })
    ),
  coordinator_bonus_percent: z
    .number()
    .default(defaultConfig.coordinator_bonus_percent)
    .describe(
      describeField({
        label: 'Бонус координатора',
        note: 'Дополнительный процент бонуса, который получает координатор проекта сверх его обычной доли. Это мотивирует координаторов к более эффективному управлению проектами.',
        rules: ['val >= 0', 'val <= 100'],
        prepend: '%',
      })
    ),
  coordinator_invite_validity_days: z
    .number()
    .default(defaultConfig.coordinator_invite_validity_days)
    .describe(
      describeField({
        label: 'Срок действия приглашения координатора',
        note: 'Максимальная продолжительность периода действия приглашений, которые координатор может отправлять новым участникам. После истечения этого срока приглашения становятся недействительными.',
        rules: ['val >= 1'],
        append: 'дней',
      })
    ),
  creators_voting_percent: z
    .number()
    .default(defaultConfig.creators_voting_percent)
    .describe(
      describeField({
        label: 'Процент голосования создателей',
        note: 'Процент от общего числа голосов, который выделяется создателям кооператива. Это обеспечивает учредителям постоянное влияние на ключевые решения организации.',
        rules: ['val >= 0', 'val <= 100'],
        prepend: '%',
      })
    ),
  expense_pool_percent: z
    .number()
    .default(defaultConfig.expense_pool_percent)
    .describe(
      describeField({
        label: 'Процент расходов на пул',
        note: 'Процент от общих расходов кооператива, который автоматически направляется в резервный фонд для непредвиденных ситуаций и развития организации.',
        rules: ['val >= 0', 'val <= 100'],
        prepend: '%',
      })
    ),
  voting_period_in_days: z
    .number()
    .default(defaultConfig.voting_period_in_days)
    .describe(
      describeField({
        label: 'Период голосования',
        note: 'Максимальная продолжительность периода голосования по предложениям в днях. После истечения этого времени голосование автоматически завершается.',
        rules: ['val >= 1'],
        append: 'дней',
      })
    ),
});

// Автоматическое создание типа IConfig на основе Zod-схемы
export type IConfig = z.infer<typeof Schema>;

// Доменные сервисы
import { IssueIdGenerationService } from './domain/services/issue-id-generation.service';

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
import { TimeEntryTypeormRepository } from './infrastructure/repositories/time-entry.typeorm-repository';
import { SegmentTypeormRepository } from './infrastructure/repositories/segment.typeorm-repository';

// Blockchain синхронизация
import { ProjectDeltaMapper } from './infrastructure/blockchain/mappers/project-delta.mapper';
import { ProjectSyncService } from './application/syncers/project-sync.service';
import { SegmentDeltaMapper } from './infrastructure/blockchain/mappers/segment-delta.mapper';
import { SegmentSyncService } from './application/syncers/segment-sync.service';

import { ContributorDeltaMapper } from './infrastructure/blockchain/mappers/contributor-delta.mapper';
import { ContributorSyncService } from './application/syncers/contributor-sync.service';
import { AppendixDeltaMapper } from './infrastructure/blockchain/mappers/appendix-delta.mapper';
import { AppendixSyncService } from './application/syncers/appendix-sync.service';
import { DebtDeltaMapper } from './infrastructure/blockchain/mappers/debt-delta.mapper';
import { DebtSyncService } from './application/syncers/debt-sync.service';
import { ExpenseDeltaMapper } from './infrastructure/blockchain/mappers/expense-delta.mapper';
import { ExpenseSyncService } from './application/syncers/expense-sync.service';
import { InvestDeltaMapper } from './infrastructure/blockchain/mappers/invest-delta.mapper';
import { InvestSyncService } from './application/syncers/invest-sync.service';
import { ResultDeltaMapper } from './infrastructure/blockchain/mappers/result-delta.mapper';
import { ResultSyncService } from './application/syncers/result-sync.service';
import { StateDeltaMapper } from './infrastructure/blockchain/mappers/state-delta.mapper';
import { StateSyncService } from './application/syncers/state-sync.service';
import { VoteDeltaMapper } from './infrastructure/blockchain/mappers/vote-delta.mapper';
import { VoteSyncService } from './application/syncers/vote-sync.service';
import { ProgramInvestDeltaMapper } from './infrastructure/blockchain/mappers/program-invest-delta.mapper';
import { ProgramInvestSyncService } from './application/syncers/program-invest-sync.service';
import { ProgramPropertyDeltaMapper } from './infrastructure/blockchain/mappers/program-property-delta.mapper';
import { ProgramPropertySyncService } from './application/syncers/program-property-sync.service';
import { ProgramWithdrawDeltaMapper } from './infrastructure/blockchain/mappers/program-withdraw-delta.mapper';
import { ProgramWithdrawSyncService } from './application/syncers/program-withdraw-sync.service';
import { ProjectPropertyDeltaMapper } from './infrastructure/blockchain/mappers/project-property-delta.mapper';
import { ProjectPropertySyncService } from './application/syncers/project-property-sync.service';
import { ProgramWalletDeltaMapper } from './infrastructure/blockchain/mappers/program-wallet-delta.mapper';
import { ProgramWalletSyncService } from './application/syncers/program-wallet-sync.service';
import { ProjectWalletDeltaMapper } from './infrastructure/blockchain/mappers/project-wallet-delta.mapper';
import { ProjectWalletSyncService } from './application/syncers/project-wallet-sync.service';
import { CapitalSyncInteractor } from './application/use-cases/capital-sync.interactor';

// Services
import { CapitalContractInfoService } from './infrastructure/services/capital-contract-info.service';
import { ContractManagementService } from './application/services/contract-management.service';
import { ParticipationManagementService } from './application/services/participation-management.service';
import { ProjectManagementService } from './application/services/project-management.service';
import { GenerationService } from './application/services/generation.service';
import { IssuePermissionsService } from './application/services/issue-permissions.service';
import { PermissionsService } from './application/services/permissions.service';
import { InvestsManagementService } from './application/services/invests-management.service';
import { DebtManagementService } from './application/services/debt-management.service';
import { PropertyManagementService } from './application/services/property-management.service';
import { VotingService } from './application/services/voting.service';
import { ResultSubmissionService } from './application/services/result-submission.service';
import { DistributionManagementService } from './application/services/distribution-management.service';
import { ExpensesManagementService } from './application/services/expenses-management.service';
import { ContributorAccountSyncService } from './application/services/contributor-account-sync.service';
import { CommitSyncService } from './application/syncers/commit-sync.service';
import { CommitDeltaMapper } from './infrastructure/blockchain/mappers/commit-delta.mapper';
import { TimeTrackingService } from './application/services/time-tracking.service';
import { SegmentsService } from './application/services/segments.service';
import { TimeTrackingSchedulerService } from './infrastructure/services/time-tracking-scheduler.service';

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
import { TIME_ENTRY_REPOSITORY } from './domain/repositories/time-entry.repository';
import { SEGMENT_REPOSITORY } from './domain/repositories/segment.repository';

import { ContractManagementResolver } from './application/resolvers/contract-management.resolver';
import { ParticipationManagementResolver } from './application/resolvers/participation-management.resolver';
import { ProjectManagementResolver } from './application/resolvers/project-management.resolver';
import { GenerationResolver } from './application/resolvers/generation.resolver';
import { InvestsManagementResolver } from './application/resolvers/invests-management.resolver';
import { DebtManagementResolver } from './application/resolvers/debt-management.resolver';
import { PropertyManagementResolver } from './application/resolvers/property-management.resolver';
import { TimeTrackerResolver } from './application/resolvers/time-tracker.resolver';
import { VotingResolver } from './application/resolvers/voting.resolver';
import { ResultSubmissionResolver } from './application/resolvers/result-submission.resolver';
import { DistributionManagementResolver } from './application/resolvers/distribution-management.resolver';
import { ExpensesManagementResolver } from './application/resolvers/expenses-management.resolver';
import { SegmentsResolver } from './application/resolvers/segments.resolver';

import { ParticipationManagementInteractor } from './application/use-cases/participation-management.interactor';
import { ClearanceManagementInteractor } from './application/use-cases/clearance-management.interactor';
import { ProjectManagementInteractor } from './application/use-cases/project-management.interactor';
import { GenerationInteractor } from './application/use-cases/generation.interactor';
import { TimeTrackingInteractor } from './application/use-cases/time-tracking.interactor';
import { InvestsManagementInteractor } from './application/use-cases/invests-management.interactor';
import { DebtManagementInteractor } from './application/use-cases/debt-management.interactor';
import { PropertyManagementInteractor } from './application/use-cases/property-management.interactor';
import { VotingInteractor } from './application/use-cases/voting.interactor';
import { ResultSubmissionInteractor } from './application/use-cases/result-submission.interactor';
import { DistributionManagementInteractor } from './application/use-cases/distribution-management.interactor';
import { ContractManagementInteractor } from './application/use-cases/contract-management.interactor';
import { ExpensesManagementInteractor } from './application/use-cases/expenses-management.interactor';
import { SegmentsInteractor } from './application/use-cases/segments.interactor';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { config as configEnv } from '~/config';
// Конфигурация модуля теперь использует IConfig из схемы

@Injectable()
export class CapitalPlugin extends BaseExtModule {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    private readonly contractManagementService: ContractManagementService,
    private readonly logger: WinstonLoggerService,
    private readonly syncInteractor: CapitalSyncInteractor
  ) {
    super();
    this.logger.setContext(CapitalPlugin.name);
  }

  name = 'capital';
  plugin!: ExtensionDomainEntity<IConfig>; // ExtensionDomainEntity<IConfig>;

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  async initialize(config?: IConfig): Promise<void> {
    this.logger.log('Модуль капитализации инициализирован');

    // Загружаем конфигурацию расширения
    const pluginData = await this.extensionRepository.findByName(this.name);
    if (!pluginData) {
      this.logger.error(`Конфигурация расширения ${this.name} не найдена`);
      return;
    }

    // Сливаем загруженную конфигурацию с дефолтными значениями
    this.plugin = {
      ...pluginData,
      config: { ...defaultConfig, ...pluginData.config },
    };

    // Если передана новая конфигурация через параметр (при restart), используем её
    // Сливаем с дефолтными значениями для обеспечения корректных типов
    const extensionConfig = { ...defaultConfig, ...(config || this.plugin.config) };

    this.logger.log(`Инициализация ${this.name} с конфигурацией`, extensionConfig);

    // Синхронизируем конфигурацию с контрактом
    try {
      const coopname = configEnv.coopname;
      const currentState = await this.contractManagementService.getState({ coopname });

      // Проверяем, нужно ли устанавливать/обновлять конфигурацию контракта
      const contractConfig = currentState?.config;

      // Получаем финальные значения для сравнения и отправки
      const finalConfig = {
        authors_voting_percent: Number(extensionConfig.authors_voting_percent ?? defaultConfig.authors_voting_percent),
        coordinator_bonus_percent: Number(
          extensionConfig.coordinator_bonus_percent ?? defaultConfig.coordinator_bonus_percent
        ),
        coordinator_invite_validity_days: Number(
          extensionConfig.coordinator_invite_validity_days ?? defaultConfig.coordinator_invite_validity_days
        ),
        creators_voting_percent: Number(extensionConfig.creators_voting_percent ?? defaultConfig.creators_voting_percent),
        expense_pool_percent: Number(extensionConfig.expense_pool_percent ?? defaultConfig.expense_pool_percent),
        voting_period_in_days: Number(extensionConfig.voting_period_in_days ?? defaultConfig.voting_period_in_days),
      };

      // Сравниваем с приведением типов
      const needsUpdate =
        !contractConfig || // Конфигурация не установлена в контракте
        Number(contractConfig.authors_voting_percent || 0) !== finalConfig.authors_voting_percent ||
        Number(contractConfig.coordinator_bonus_percent || 0) !== finalConfig.coordinator_bonus_percent ||
        Number(contractConfig.coordinator_invite_validity_days || 0) !== finalConfig.coordinator_invite_validity_days ||
        Number(contractConfig.creators_voting_percent || 0) !== finalConfig.creators_voting_percent ||
        Number(contractConfig.expense_pool_percent || 0) !== finalConfig.expense_pool_percent ||
        Number(contractConfig.voting_period_in_days || 0) !== finalConfig.voting_period_in_days;

      if (needsUpdate) {
        const action = contractConfig ? 'обновление' : 'установка начальной';
        this.logger.log(`Выполняем ${action} конфигурации контракта CAPITAL`);

        await this.contractManagementService.setConfig({
          coopname,
          config: finalConfig,
        });

        this.logger.log(`Конфигурация контракта CAPITAL успешно ${contractConfig ? 'обновлена' : 'установлена'}`);
      } else {
        this.logger.log('Конфигурация контракта CAPITAL уже актуальна');
      }
    } catch (error: any) {
      this.logger.error(`Не удалось синхронизировать конфигурацию с контрактом CAPITAL: ${error.message}`, error.stack);
      // Не бросаем ошибку, чтобы не блокировать запуск модуля
    }

    // Инициализируем синхронизацию с блокчейном
    try {
      await this.syncInteractor.initializeSync();
      this.logger.log('Синхронизация капитализации с блокчейном инициализирована');
    } catch (error: any) {
      this.logger.error(
        `Не удалось инициализировать синхронизацию капитализации с блокчейном: ${error.message}`,
        error.stack
      );
      // Не бросаем ошибку, чтобы не блокировать запуск модуля
    }
  }
}

@Module({
  imports: [CapitalDatabaseModule, EventsInfrastructureModule, DocumentDomainModule, ExtensionPortsModule],
  providers: [
    // Plugin
    CapitalPlugin,

    // Domain Services
    IssueIdGenerationService,

    // Services
    CapitalContractInfoService,
    ContractManagementService,
    ParticipationManagementService,
    ProjectManagementService,
    GenerationService,
    IssuePermissionsService,
    PermissionsService,
    InvestsManagementService,
    DebtManagementService,
    PropertyManagementService,
    VotingService,
    ResultSubmissionService,
    DistributionManagementService,
    ExpensesManagementService,
    ContributorAccountSyncService,
    SegmentsService,

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
    DebtDeltaMapper,
    DebtSyncService,
    ExpenseDeltaMapper,
    ExpenseSyncService,
    InvestDeltaMapper,
    InvestSyncService,
    ResultDeltaMapper,
    ResultSyncService,
    StateDeltaMapper,
    StateSyncService,
    VoteDeltaMapper,
    VoteSyncService,
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
    SegmentDeltaMapper,
    SegmentSyncService,
    CommitSyncService,
    CommitDeltaMapper,
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
    SegmentsResolver,
    TimeTrackerResolver,
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
    {
      provide: TIME_ENTRY_REPOSITORY,
      useClass: TimeEntryTypeormRepository,
    },
    {
      provide: SEGMENT_REPOSITORY,
      useClass: SegmentTypeormRepository,
    },

    // Services that depend on repositories
    TimeTrackingService,
    TimeTrackingSchedulerService,

    // Use Cases
    ContractManagementInteractor,
    ParticipationManagementInteractor,
    ClearanceManagementInteractor,
    ProjectManagementInteractor,
    GenerationInteractor,
    TimeTrackingInteractor,
    InvestsManagementInteractor,
    DebtManagementInteractor,
    PropertyManagementInteractor,
    VotingInteractor,
    ResultSubmissionInteractor,
    DistributionManagementInteractor,
    ExpensesManagementInteractor,
    SegmentsInteractor,
    CapitalSyncInteractor,
  ],
  exports: [CapitalPlugin],
})
export class CapitalPluginModule {
  constructor(private readonly capitalPlugin: CapitalPlugin) {}

  async initialize() {
    await this.capitalPlugin.initialize();
  }
}
