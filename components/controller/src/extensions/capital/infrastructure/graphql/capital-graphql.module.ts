// capital/infrastructure/graphql/capital-graphql.module.ts
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import config from '~/config/config';
import { ApolloDriver } from '@nestjs/apollo';
import logger from '~/config/logger';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

// Импортируем все capital резолверы
import { ContractManagementResolver } from '../../application/resolvers/contract-management.resolver';
import { ParticipationManagementResolver } from '../../application/resolvers/participation-management.resolver';
import { ProjectManagementResolver } from '../../application/resolvers/project-management.resolver';
import { GenerationResolver } from '../../application/resolvers/generation.resolver';
import { InvestsManagementResolver } from '../../application/resolvers/invests-management.resolver';
import { DebtManagementResolver } from '../../application/resolvers/debt-management.resolver';
import { PropertyManagementResolver } from '../../application/resolvers/property-management.resolver';
import { VotingResolver } from '../../application/resolvers/voting.resolver';
import { ResultSubmissionResolver } from '../../application/resolvers/result-submission.resolver';
import { DistributionManagementResolver } from '../../application/resolvers/distribution-management.resolver';

// Импортируем сервисы и интеракторы
import { CapitalService } from '../../application/services/capital.service';
import { CapitalContractInfoService } from '../services/capital-contract-info.service';
import { CapitalBlockchainService } from '../blockchain/services/capital-blockchain.service';
import { CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';

// Импортируем интеракторы
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
import { CapitalSyncInteractor } from '../../domain/interactors/capital-sync.interactor';

// Импортируем репозитории
import { PROJECT_REPOSITORY } from '../../domain/repositories/project.repository';
import { CONTRIBUTOR_REPOSITORY } from '../../domain/repositories/contributor.repository';
import { APPENDIX_REPOSITORY } from '../../domain/repositories/appendix.repository';
import { PROGRAM_INVEST_REPOSITORY } from '../../domain/repositories/program-invest.repository';
import { PROGRAM_PROPERTY_REPOSITORY } from '../../domain/repositories/program-property.repository';
import { PROGRAM_WITHDRAW_REPOSITORY } from '../../domain/repositories/program-withdraw.repository';
import { PROJECT_PROPERTY_REPOSITORY } from '../../domain/repositories/project-property.repository';
import { PROGRAM_WALLET_REPOSITORY } from '../../domain/repositories/program-wallet.repository';
import { PROJECT_WALLET_REPOSITORY } from '../../domain/repositories/project-wallet.repository';
import { CYCLE_REPOSITORY } from '../../domain/repositories/cycle.repository';
import { ISSUE_REPOSITORY } from '../../domain/repositories/issue.repository';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import { STORY_REPOSITORY } from '../../domain/repositories/story.repository';

// Импортируем мапперы и сервисы синхронизации
import { ProjectDeltaMapper } from '../blockchain/mappers/project-delta.mapper';
import { ProjectSyncService } from '../blockchain/services/project-sync.service';
import { ContributorDeltaMapper } from '../blockchain/mappers/contributor-delta.mapper';
import { ContributorSyncService } from '../blockchain/services/contributor-sync.service';
import { AppendixDeltaMapper } from '../blockchain/mappers/appendix-delta.mapper';
import { AppendixSyncService } from '../blockchain/services/appendix-sync.service';
import { ProgramInvestDeltaMapper } from '../blockchain/mappers/program-invest-delta.mapper';
import { ProgramInvestSyncService } from '../blockchain/services/program-invest-sync.service';
import { ProgramPropertyDeltaMapper } from '../blockchain/mappers/program-property-delta.mapper';
import { ProgramPropertySyncService } from '../blockchain/services/program-property-sync.service';
import { ProgramWithdrawDeltaMapper } from '../blockchain/mappers/program-withdraw-delta.mapper';
import { ProgramWithdrawSyncService } from '../blockchain/services/program-withdraw-sync.service';
import { ProjectPropertyDeltaMapper } from '../blockchain/mappers/project-property-delta.mapper';
import { ProjectPropertySyncService } from '../blockchain/services/project-property-sync.service';
import { ProgramWalletDeltaMapper } from '../blockchain/mappers/program-wallet-delta.mapper';
import { ProgramWalletSyncService } from '../blockchain/services/program-wallet-sync.service';
import { ProjectWalletDeltaMapper } from '../blockchain/mappers/project-wallet-delta.mapper';
import { ProjectWalletSyncService } from '../blockchain/services/project-wallet-sync.service';

// Импортируем репозитории
import { ProjectTypeormRepository } from '../repositories/project.typeorm-repository';
import { ContributorTypeormRepository } from '../repositories/contributor.typeorm-repository';
import { AppendixTypeormRepository } from '../repositories/appendix.typeorm-repository';
import { ProgramInvestTypeormRepository } from '../repositories/program-invest.typeorm-repository';
import { ProgramPropertyTypeormRepository } from '../repositories/program-property.typeorm-repository';
import { ProgramWithdrawTypeormRepository } from '../repositories/program-withdraw.typeorm-repository';
import { ProjectPropertyTypeormRepository } from '../repositories/project-property.typeorm-repository';
import { ProgramWalletTypeormRepository } from '../repositories/program-wallet.typeorm-repository';
import { ProjectWalletTypeormRepository } from '../repositories/project-wallet.typeorm-repository';
import { CycleTypeormRepository } from '../repositories/cycle.typeorm-repository';
import { IssueTypeormRepository } from '../repositories/issue.typeorm-repository';
import { CommentTypeormRepository } from '../repositories/comment.typeorm-repository';
import { StoryTypeormRepository } from '../repositories/story.typeorm-repository';

@Global()
@Module({
  imports: [
    // Создаем отдельный GraphQL модуль только для capital эндпоинта
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: () => ({
        introspection: true,
        // Используем существующую схему, но с отдельным эндпоинтом
        autoSchemaFile: false,
        sortSchema: true,
        debug: config.env !== 'production',
        // Пропускаем проверку типов для избежания конфликтов
        skipCheck: true,
        // Настройки для сборки схемы
        buildSchemaOptions: {
          // Обрабатываем конфликты типов
          orphanedTypes: [],
        },
        playground: { endpoint: '/v1/graphql/capital', settings: { 'request.credentials': 'same-origin' } },
        path: '/v1/graphql/capital',
        // Отключаем директивы для capital модуля, чтобы избежать конфликтов
        // transformSchema: (schema) => {
        //   schema = docDirectiveTransformer(schema, 'auth');
        //   schema = fieldAuthDirectiveTransformer(schema, 'auth');
        //   return schema;
        // },
        formatError: (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
          let extensions = formattedError.extensions || {};
          let message = formattedError.message;
          console.log(formattedError);
          if (error instanceof GraphQLError) {
            if (error.originalError instanceof Error) {
              message = error.originalError.message;
              extensions = {
                ...extensions,
                code: extensions.code || 'INTERNAL_SERVER_ERROR',
                stacktrace: process.env.NODE_ENV === 'development' ? error.originalError.stack : undefined,
              };
            }
          } else if (error instanceof Error) {
            message = error.message;
            extensions = {
              ...extensions,
              code: 'INTERNAL_SERVER_ERROR',
              stacktrace: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            };
          }

          logger.error({
            message: `Capital GraphQL Error: ${message}`,
            extensions,
          });

          return {
            message,
            extensions,
          };
        },
      }),
    }),
  ],
  providers: [
    // Capital резолверы
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

    // Services
    CapitalContractInfoService,
    CapitalService,

    // CAPITAL Application Layer Dependencies
    {
      provide: CAPITAL_BLOCKCHAIN_PORT,
      useClass: CapitalBlockchainService,
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
  ],
  exports: [GraphQLModule],
})
export class CapitalGraphqlModule {}
