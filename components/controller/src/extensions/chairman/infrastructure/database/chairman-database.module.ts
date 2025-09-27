import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalTypeormEntity } from '../entities/approval.typeorm-entity';
import config from '~/config/config';

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

        entities: [ApprovalTypeormEntity],
        synchronize: config.env === 'development', // Используем миграции для production
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([ApprovalTypeormEntity], CHAIRMAN_DATABASE_CONNECTION),
  ],
  exports: [TypeOrmModule],
})
export class ChairmanDatabaseModule {}
