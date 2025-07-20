import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CycleTypeormEntity } from '../entities/cycle.typeorm-entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import { AssignmentTypeormEntity } from '../entities/assignment.typeorm-entity';
import { CommitTypeormEntity } from '../entities/commit.typeorm-entity';
import { ResultShareTypeormEntity } from '../entities/result-share.typeorm-entity';
import { config } from '~/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'capital', // Отдельное подключение для capital
      useFactory: () => ({
        type: 'postgres',
        host: config.postgres.host,
        port: Number(config.postgres.port),
        username: config.postgres.username,
        password: config.postgres.password,
        database: config.postgres.database,

        entities: [
          CycleTypeormEntity,
          ProjectTypeormEntity,
          ContributorTypeormEntity,
          AssignmentTypeormEntity,
          CommitTypeormEntity,
          ResultShareTypeormEntity,
        ],
        synchronize: true, // В продакшене использовать миграции
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature(
      [
        CycleTypeormEntity,
        ProjectTypeormEntity,
        ContributorTypeormEntity,
        AssignmentTypeormEntity,
        CommitTypeormEntity,
        ResultShareTypeormEntity,
      ],
      'capital'
    ), // Указываем connection name
  ],
  exports: [TypeOrmModule],
})
export class CapitalDatabaseModule {}
