import { Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import { CoopgramDatabaseModule } from './infrastructure/database/coopgram-database.module';
import { CoopgramApplicationService } from './application/services/coopgram-application.service';
import { MatrixApiService } from './application/services/matrix-api.service';
import { MatrixUserManagementService } from './domain/services/matrix-user-management.service';
import { MatrixTokenManagementService } from './domain/services/matrix-token-management.service';
import { CoopgramResolver } from './application/resolvers/coopgram.resolver';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

// Пустая схема для расширения без конфигурации
export const Schema = z.object({});

// Репозитории
import { MatrixUserTypeormRepository } from './infrastructure/repositories/matrix-user.typeorm-repository';
import { MatrixTokenTypeormRepository } from './infrastructure/repositories/matrix-token.typeorm-repository';

// Символы для DI
import { MATRIX_USER_REPOSITORY } from './domain/repositories/matrix-user.repository';
import { MATRIX_TOKEN_REPOSITORY } from './domain/repositories/matrix-token.repository';

@Injectable()
export class CoopgramPlugin extends BaseExtModule {
  constructor(private readonly logger: WinstonLoggerService, private readonly matrixApiService: MatrixApiService) {
    super();
    this.logger.setContext(CoopgramPlugin.name);
  }

  name = 'coopgram';
  plugin!: any;
  configSchemas = Schema;
  defaultConfig = {};

  async initialize(): Promise<void> {
    try {
      this.logger.log('Coopgram module initializing...');

      // Выполняем логин администратора при инициализации
      await this.matrixApiService.loginAdmin();

      this.logger.log('Coopgram module initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Coopgram module', JSON.stringify(error));
      throw error;
    }
  }
}

@Module({
  imports: [CoopgramDatabaseModule, ConfigModule],
  providers: [
    // Plugin
    CoopgramPlugin,

    // Application Services
    CoopgramApplicationService,
    MatrixApiService,

    // Domain Services
    MatrixUserManagementService,
    MatrixTokenManagementService,

    // Repositories
    {
      provide: MATRIX_USER_REPOSITORY,
      useClass: MatrixUserTypeormRepository,
    },
    {
      provide: MATRIX_TOKEN_REPOSITORY,
      useClass: MatrixTokenTypeormRepository,
    },

    // GraphQL Resolvers
    CoopgramResolver,
  ],
  exports: [CoopgramPlugin],
})
export class CoopgramPluginModule {
  constructor(private readonly coopgramPlugin: CoopgramPlugin) {}

  async initialize() {
    await this.coopgramPlugin.initialize();
  }
}
