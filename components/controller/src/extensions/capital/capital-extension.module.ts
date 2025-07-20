import { Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import { CapitalDatabaseModule } from './infrastructure/database/capital-database.module';
import { CapitalApplicationService } from './application/services/capital-application.service';
import { ProjectManagementService } from './domain/services/project-management.service';
import { CommitManagementService } from './domain/services/commit-management.service';
import { ResultCalculationService } from './domain/services/result-calculation.service';
import { ProjectResolver } from './application/resolvers/project.resolver';
import { AssignmentResolver } from './application/resolvers/assignment.resolver';
import { CommitResolver } from './application/resolvers/commit.resolver';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';

// Репозитории
import { CycleTypeormRepository } from './infrastructure/repositories/cycle.typeorm-repository';
import { ProjectTypeormRepository } from './infrastructure/repositories/project.typeorm-repository';
import { ContributorTypeormRepository } from './infrastructure/repositories/contributor.typeorm-repository';

// Символы для DI
import { CYCLE_REPOSITORY } from './domain/repositories/cycle.repository';
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY } from './domain/repositories/contributor.repository';
import { ASSIGNMENT_REPOSITORY } from './domain/repositories/assignment.repository';
import { COMMIT_REPOSITORY } from './domain/repositories/commit.repository';
import { RESULT_SHARE_REPOSITORY } from './domain/repositories/result-share.repository';

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
  constructor(private readonly logger: WinstonLoggerService) {
    super();
    this.logger.setContext(CapitalPlugin.name);
  }

  name = 'capital';
  plugin!: any; // ExtensionDomainEntity<ICapitalConfig>;

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  async initialize(): Promise<void> {
    this.logger.log('Capital module initialized');
  }
}

@Module({
  imports: [CapitalDatabaseModule],
  providers: [
    // Plugin
    CapitalPlugin,

    // Application Services
    CapitalApplicationService,

    // Domain Services
    ProjectManagementService,
    CommitManagementService,
    ResultCalculationService,

    // Repositories
    {
      provide: CYCLE_REPOSITORY,
      useClass: CycleTypeormRepository,
    },
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectTypeormRepository,
    },
    {
      provide: CONTRIBUTOR_REPOSITORY,
      useClass: ContributorTypeormRepository,
    },
    // TODO: Добавить остальные репозитории когда будут созданы
    {
      provide: ASSIGNMENT_REPOSITORY,
      useValue: {}, // Заглушка
    },
    {
      provide: COMMIT_REPOSITORY,
      useValue: {}, // Заглушка
    },
    {
      provide: RESULT_SHARE_REPOSITORY,
      useValue: {}, // Заглушка
    },

    // GraphQL Resolvers
    ProjectResolver,
    AssignmentResolver,
    CommitResolver,
  ],
  exports: [CapitalPlugin],
})
export class CapitalPluginModule {}
