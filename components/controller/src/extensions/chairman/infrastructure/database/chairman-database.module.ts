import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalTypeormEntity } from '../entities/approval.typeorm-entity';
import config from '~/config/config';
import { EntityVersionTypeormEntity } from '~/shared/sync/entities/entity-version.typeorm-entity';

// Константа для имени подключения к базе данных chairman
export const CHAIRMAN_DATABASE_CONNECTION = 'chairman';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: CHAIRMAN_DATABASE_CONNECTION, // Отдельное подключение для chairman
      useFactory: () => ({
        type: 'postgres',
        host: config.postgres.host,
        port: Number(config.postgres.port),
        username: config.postgres.username,
        password: config.postgres.password,
        database: config.postgres.database,

        entities: [ApprovalTypeormEntity, EntityVersionTypeormEntity],
//        synchronize: config.env === 'development', // Используем миграции для production
        synchronize: true, // Временно всегда синхронизируем
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([ApprovalTypeormEntity, EntityVersionTypeormEntity], CHAIRMAN_DATABASE_CONNECTION),
  ],
  exports: [TypeOrmModule],
})
export class ChairmanDatabaseModule {}
