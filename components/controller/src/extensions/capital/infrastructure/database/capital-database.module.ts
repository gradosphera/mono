import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import { config } from '~/config';

// Константа для имени подключения к базе данных capital
export const CAPITAL_DATABASE_CONNECTION = 'capital';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: CAPITAL_DATABASE_CONNECTION, // Отдельное подключение для capital
      useFactory: () => ({
        type: 'postgres',
        host: config.postgres.host,
        port: Number(config.postgres.port),
        username: config.postgres.username,
        password: config.postgres.password,
        database: config.postgres.database,

        entities: [ProjectTypeormEntity, ContributorTypeormEntity],
        synchronize: config.env === 'development', // Используем миграции
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([ProjectTypeormEntity, ContributorTypeormEntity], CAPITAL_DATABASE_CONNECTION), // Указываем connection name
  ],
  exports: [TypeOrmModule],
})
export class CapitalDatabaseModule {}
