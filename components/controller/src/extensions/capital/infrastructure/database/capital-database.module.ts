import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import { AppendixTypeormEntity } from '../entities/appendix.typeorm-entity';
import { ProgramInvestTypeormEntity } from '../entities/program-invest.typeorm-entity';
import { ProgramPropertyTypeormEntity } from '../entities/program-property.typeorm-entity';
import { ProgramWithdrawTypeormEntity } from '../entities/program-withdraw.typeorm-entity';
import { ProjectPropertyTypeormEntity } from '../entities/project-property.typeorm-entity';
import { ProgramWalletTypeormEntity } from '../entities/program-wallet.typeorm-entity';
import { ProjectWalletTypeormEntity } from '../entities/project-wallet.typeorm-entity';
import { CycleTypeormEntity } from '../entities/cycle.typeorm-entity';
import { IssueTypeormEntity } from '../entities/issue.typeorm-entity';
import { CommentTypeormEntity } from '../entities/comment.typeorm-entity';
import { StoryTypeormEntity } from '../entities/story.typeorm-entity';
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

        entities: [
          ProjectTypeormEntity,
          ContributorTypeormEntity,
          AppendixTypeormEntity,
          ProgramInvestTypeormEntity,
          ProgramPropertyTypeormEntity,
          ProgramWithdrawTypeormEntity,
          ProjectPropertyTypeormEntity,
          ProgramWalletTypeormEntity,
          ProjectWalletTypeormEntity,
          CycleTypeormEntity,
          IssueTypeormEntity,
          CommentTypeormEntity,
          StoryTypeormEntity,
        ],
        synchronize: config.env === 'development', // Используем миграции для production
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature(
      [
        ProjectTypeormEntity,
        ContributorTypeormEntity,
        AppendixTypeormEntity,
        ProgramInvestTypeormEntity,
        ProgramPropertyTypeormEntity,
        ProgramWithdrawTypeormEntity,
        ProjectPropertyTypeormEntity,
        ProgramWalletTypeormEntity,
        ProjectWalletTypeormEntity,
        CycleTypeormEntity,
        IssueTypeormEntity,
        CommentTypeormEntity,
        StoryTypeormEntity,
      ],
      CAPITAL_DATABASE_CONNECTION
    ), // Указываем connection name
  ],
  exports: [TypeOrmModule],
})
export class CapitalDatabaseModule {}
