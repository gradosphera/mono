import { Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import { CapitalDatabaseModule } from './infrastructure/database/capital-database.module';
import { EventsInfrastructureModule } from '~/infrastructure/events/events.module';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

// Репозитории
import { ProjectTypeormRepository } from './infrastructure/repositories/project.typeorm-repository';
import { ContributorTypeormRepository } from './infrastructure/repositories/contributor.typeorm-repository';

// Blockchain синхронизация
import { BlockchainDeltaTrackerService } from './infrastructure/blockchain/services/blockchain-delta-tracker.service';
import { ProjectDeltaMapper } from './infrastructure/blockchain/mappers/project-delta.mapper';
import { ProjectSyncService } from './infrastructure/blockchain/services/project-sync.service';
import { ContributorDeltaMapper } from './infrastructure/blockchain/mappers/contributor-delta.mapper';
import { ContributorSyncService } from './infrastructure/blockchain/services/contributor-sync.service';
import { CapitalSyncInteractor } from './domain/interactors/capital-sync.interactor';

// Services
import { CapitalContractInfoService } from './infrastructure/services/capital-contract-info.service';

// Символы для DI
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY } from './domain/repositories/contributor.repository';

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
  ],
  exports: [CapitalPlugin],
})
export class CapitalPluginModule {
  constructor(private readonly capitalPlugin: CapitalPlugin) {}

  async initialize() {
    await this.capitalPlugin.initialize();
  }
}
