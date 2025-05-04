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
import { MEET_REPOSITORY } from '~/domain/meet/repositories/meet.repository';
import { TypeOrmMeetRepository } from './repositories/typeorm-meet.repository';
import { MigrationEntity } from './entities/migration.entity';
import { MIGRATION_REPOSITORY } from '~/domain/system/repositories/migration-domain.repository';
import { TypeOrmMigrationRepository } from './repositories/typeorm-migration.repository';

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
    NestTypeOrmModule.forFeature([ExtensionEntity, LogExtensionEntity, MeetPreEntity, MigrationEntity]),
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
      provide: MIGRATION_REPOSITORY,
      useClass: TypeOrmMigrationRepository,
    },
  ],
  exports: [NestTypeOrmModule, EXTENSION_REPOSITORY, LOG_EXTENSION_REPOSITORY, MEET_REPOSITORY, MIGRATION_REPOSITORY],
})
export class TypeOrmModule {}
