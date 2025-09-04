// infrastructure/database/typeorm/typeorm.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import config from '~/config/config';
import { EXTENSION_REPOSITORY } from '~/domain/extension/repositories/extension-domain.repository';
import { TypeOrmExtensionDomainRepository } from './repositories/typeorm-extension.repository';
import { ExtensionEntity } from './entities/extension.entity';
import { LogExtensionEntity } from './entities/log-extension.entity';
import { LOG_EXTENSION_REPOSITORY } from '~/domain/extension/repositories/log-extension-domain.repository';
import { TypeOrmLogExtensionDomainRepository } from './repositories/typeorm-log-extension.repository';
import { MeetPreEntity } from './entities/meet-pre.entity';
import { MEET_REPOSITORY } from '~/domain/meet/repositories/meet-pre.repository';
import { TypeOrmMeetRepository } from './repositories/typeorm-meet.repository';
import { MigrationEntity } from './entities/migration.entity';
import { MIGRATION_REPOSITORY } from '~/domain/system/repositories/migration-domain.repository';
import { TypeOrmMigrationRepository } from './repositories/typeorm-migration.repository';
import { CandidateEntity } from './entities/candidate.entity';
import { CANDIDATE_REPOSITORY } from '~/domain/account/repository/candidate.repository';
import { TypeOrmCandidateRepository } from './repositories/typeorm-candidate.repository';
import { MeetProcessedEntity } from './entities/meet-processed.entity';
import { MEET_PROCESSED_REPOSITORY } from '~/domain/meet/repositories/meet-processed.repository';
import { TypeOrmMeetProcessedRepository } from './repositories/typeorm-meet-processed.repository';
import { PaymentEntity } from './entities/payment.entity';
import { PAYMENT_REPOSITORY } from '~/domain/gateway/repositories/payment.repository';
import { TypeOrmPaymentRepository } from './repositories/typeorm-payment.repository';
import { WebPushSubscriptionEntity } from './entities/web-push-subscription.entity';
import { WEB_PUSH_SUBSCRIPTION_PORT } from '~/domain/notification/interfaces/web-push-subscription.port';
import { TypeOrmWebPushSubscriptionRepository } from './repositories/typeorm-web-push-subscription.repository';
import { LEDGER_OPERATION_REPOSITORY } from '~/domain/ledger/repositories/ledger-operation.repository';
import { TypeOrmLedgerOperationRepository } from './repositories/typeorm-ledger-operation.repository';
import { LedgerOperationEntity } from './entities/ledger-operation.entity';
import { ActionEntity } from './entities/action.entity';
import { DeltaEntity } from './entities/delta.entity';
import { ForkEntity } from './entities/fork.entity';
import { SyncStateEntity } from './entities/sync-state.entity';
import { ACTION_REPOSITORY_PORT } from '~/domain/parser/ports/action-repository.port';
import { DELTA_REPOSITORY_PORT } from '~/domain/parser/ports/delta-repository.port';
import { FORK_REPOSITORY_PORT } from '~/domain/parser/ports/fork-repository.port';
import { SYNC_STATE_REPOSITORY_PORT } from '~/domain/parser/ports/sync-state-repository.port';
import { TypeOrmActionRepository } from './repositories/typeorm-action.repository';
import { TypeOrmDeltaRepository } from './repositories/typeorm-delta.repository';
import { TypeOrmForkRepository } from './repositories/typeorm-fork.repository';
import { TypeOrmSyncStateRepository } from './repositories/typeorm-sync-state.repository';

@Global()
@Module({
  imports: [
    NestTypeOrmModule.forRoot({
      type: 'postgres',
      host: config.postgres.host,
      port: Number(config.postgres.port),
      username: config.postgres.username,
      password: config.postgres.password,
      database: config.postgres.database,
      entities: [path.join(__dirname, '**/entities/*.entity.{ts,js}')],
      synchronize: true, // Отключите в продакшене
      logging: false,
    }),
    NestTypeOrmModule.forFeature([
      ExtensionEntity,
      LogExtensionEntity,
      MeetPreEntity,
      MeetProcessedEntity,
      MigrationEntity,
      CandidateEntity,
      PaymentEntity,
      WebPushSubscriptionEntity,
      LedgerOperationEntity,
      ActionEntity,
      DeltaEntity,
      ForkEntity,
      SyncStateEntity,
    ]),
  ],
  providers: [
    {
      provide: EXTENSION_REPOSITORY,
      useClass: TypeOrmExtensionDomainRepository,
    },
    {
      provide: LOG_EXTENSION_REPOSITORY,
      useClass: TypeOrmLogExtensionDomainRepository,
    },
    {
      provide: MEET_REPOSITORY,
      useClass: TypeOrmMeetRepository,
    },
    {
      provide: MEET_PROCESSED_REPOSITORY,
      useClass: TypeOrmMeetProcessedRepository,
    },
    {
      provide: MIGRATION_REPOSITORY,
      useClass: TypeOrmMigrationRepository,
    },
    {
      provide: CANDIDATE_REPOSITORY,
      useClass: TypeOrmCandidateRepository,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: TypeOrmPaymentRepository,
    },
    {
      provide: WEB_PUSH_SUBSCRIPTION_PORT,
      useClass: TypeOrmWebPushSubscriptionRepository,
    },
    {
      provide: LEDGER_OPERATION_REPOSITORY,
      useClass: TypeOrmLedgerOperationRepository,
    },
    {
      provide: ACTION_REPOSITORY_PORT,
      useClass: TypeOrmActionRepository,
    },
    {
      provide: DELTA_REPOSITORY_PORT,
      useClass: TypeOrmDeltaRepository,
    },
    {
      provide: FORK_REPOSITORY_PORT,
      useClass: TypeOrmForkRepository,
    },
    {
      provide: SYNC_STATE_REPOSITORY_PORT,
      useClass: TypeOrmSyncStateRepository,
    },
  ],
  exports: [
    NestTypeOrmModule,
    EXTENSION_REPOSITORY,
    LOG_EXTENSION_REPOSITORY,
    MEET_REPOSITORY,
    MEET_PROCESSED_REPOSITORY,
    MIGRATION_REPOSITORY,
    CANDIDATE_REPOSITORY,
    PAYMENT_REPOSITORY,
    WEB_PUSH_SUBSCRIPTION_PORT,
    LEDGER_OPERATION_REPOSITORY,
    ACTION_REPOSITORY_PORT,
    DELTA_REPOSITORY_PORT,
    FORK_REPOSITORY_PORT,
    SYNC_STATE_REPOSITORY_PORT,
  ],
})
export class TypeOrmModule {}
