import { Module } from '@nestjs/common';
import { ExpensesDatabaseModule } from './infrastructure/database/expenses-database.module';
import { ExpenseContractInfoService } from './infrastructure/services/expense-contract-info.service';
import { ExpenseProposalDeltaMapper } from './infrastructure/blockchain/mappers/expense-proposal-delta.mapper';
import { ExpenseProposalTypeormRepository } from './infrastructure/repositories/expense-proposal.typeorm-repository';
import { ExpenseFileTypeormRepository } from './infrastructure/repositories/expense-file.typeorm-repository';
import { EXPENSE_PROPOSAL_REPOSITORY } from './domain/repositories/expense-proposal.repository';
import { EXPENSE_FILE_REPOSITORY } from './domain/repositories/expense-file.repository';

/**
 * Шасси расходов цифрового кооператива (MVP — Благорост).
 *
 * Backend-сторона контракта `expense`:
 *   - TypeORM-зеркало on-chain proposals + items;
 *   - MinIO-bucket `expenses:files` (платёжки/чеки/возвраты);
 *   - GraphQL Query/Mutation для UI;
 *   - sync через parser2 (после ABI regen).
 *
 * Расширение НЕ предоставляет собственного «стола» — расход живёт в Столе
 * Благороста и Председателя. Поэтому в `AppRegistry` запись не заводится,
 * модуль подключается напрямую в `ExtensionsModule.register()`.
 *
 * Подробности и план реализации — см. `README.md` рядом.
 */
@Module({
  imports: [ExpensesDatabaseModule],
  providers: [
    ExpenseContractInfoService,
    ExpenseProposalDeltaMapper,
    ExpenseProposalTypeormRepository,
    ExpenseFileTypeormRepository,
    {
      provide: EXPENSE_PROPOSAL_REPOSITORY,
      useClass: ExpenseProposalTypeormRepository,
    },
    {
      provide: EXPENSE_FILE_REPOSITORY,
      useClass: ExpenseFileTypeormRepository,
    },
  ],
  exports: [
    ExpenseContractInfoService,
    ExpenseProposalDeltaMapper,
    EXPENSE_PROPOSAL_REPOSITORY,
    EXPENSE_FILE_REPOSITORY,
  ],
})
export class ExpensesExtensionModule {}
