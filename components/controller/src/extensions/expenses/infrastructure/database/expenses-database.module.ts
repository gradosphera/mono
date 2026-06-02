import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseProposalTypeormEntity } from '../entities/expense-proposal.typeorm-entity';
import { ExpenseFileTypeormEntity } from '../entities/expense-file.typeorm-entity';
import { EntityVersionTypeormEntity } from '~/shared/sync/entities/entity-version.typeorm-entity';

/**
 * TypeORM-модуль расширения `expense` — зеркало SP-расходов + реестр файлов.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpenseProposalTypeormEntity,
      ExpenseFileTypeormEntity,
      EntityVersionTypeormEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class ExpensesDatabaseModule {}
