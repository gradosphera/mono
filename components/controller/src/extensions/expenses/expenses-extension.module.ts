import { Module } from '@nestjs/common';

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
  imports: [],
  providers: [],
  exports: [],
})
export class ExpensesExtensionModule {}
