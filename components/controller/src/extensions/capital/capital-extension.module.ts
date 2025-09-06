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
import { ProgramInvestTypeormRepository } from './infrastructure/repositories/program-invest.typeorm-repository';
import { ProgramPropertyTypeormRepository } from './infrastructure/repositories/program-property.typeorm-repository';
import { ProgramWithdrawTypeormRepository } from './infrastructure/repositories/program-withdraw.typeorm-repository';
import { ProjectPropertyTypeormRepository } from './infrastructure/repositories/project-property.typeorm-repository';
import { ProgramWalletTypeormRepository } from './infrastructure/repositories/program-wallet.typeorm-repository';
import { ProjectWalletTypeormRepository } from './infrastructure/repositories/project-wallet.typeorm-repository';

// Blockchain синхронизация
import { BlockchainDeltaTrackerService } from './infrastructure/blockchain/services/blockchain-delta-tracker.service';
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

// Символы для DI
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY } from './domain/repositories/contributor.repository';
import { APPENDIX_REPOSITORY } from './domain/repositories/appendix.repository';
import { PROGRAM_INVEST_REPOSITORY } from './domain/repositories/program-invest.repository';
import { PROGRAM_PROPERTY_REPOSITORY } from './domain/repositories/program-property.repository';
import { PROGRAM_WITHDRAW_REPOSITORY } from './domain/repositories/program-withdraw.repository';
import { PROJECT_PROPERTY_REPOSITORY } from './domain/repositories/project-property.repository';
import { PROGRAM_WALLET_REPOSITORY } from './domain/repositories/program-wallet.repository';
import { PROJECT_WALLET_REPOSITORY } from './domain/repositories/project-wallet.repository';

import { z } from 'zod';

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

    // Blockchain Sync Services
    BlockchainDeltaTrackerService,
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

    // Domain Interactors
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
  ],
  exports: [CapitalPlugin],
})
export class CapitalPluginModule {
  constructor(private readonly capitalPlugin: CapitalPlugin) {}

  async initialize() {
    await this.capitalPlugin.initialize();
  }
}
