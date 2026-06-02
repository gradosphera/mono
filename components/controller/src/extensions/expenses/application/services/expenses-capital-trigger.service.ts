import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { ExpenseProposalDomainEntity } from '../../domain/entities/expense-proposal.entity';
import { ExpenseProposalStatus } from '../../domain/enums/expense-proposal-status.enum';
import {
  ExpenseProposalRepository,
  EXPENSE_PROPOSAL_REPOSITORY,
} from '../../domain/repositories/expense-proposal.repository';

/**
 * Триггер capitalization Благоросты при закрытии сметы расхода (CLOSED).
 *
 * Программная подписка на `entitysynced::expense::proposals` (emit'ит
 * `ExpenseProposalSyncService` после save в PG). При переходе сметы в CLOSED
 * (`expense::closeexp` авторизовал отчёт) — вызвать capital extension для
 * создания РИД-сегмента в Благоросте на сумму `total_actual`.
 *
 * MVP-skeleton: пока без программного DI на `CapitalExtensionModule` — coupling
 * двух extensions через WriteMutationPool подключится после Эпика 0
 * (cooptypes regen для `capital::createrid`-эквивалента + canonical action-code
 * `CAPITALIZATION` в `LEDGER2_ACTION_REGISTRY`). До этого — log + TODO.
 *
 * Идемпотентность: подписан на `entitysynced` не на raw `delta::*`, то есть
 * сработает только после успешного save в PG. Дополнительная защита от
 * повторной capitalization — по полю `_blagorost_segment_hash` в БД зеркала
 * (TODO: миграция zero-or-one segment per proposal).
 */
@Injectable()
export class ExpensesCapitalTriggerService {
  constructor(
    @Inject(EXPENSE_PROPOSAL_REPOSITORY)
    private readonly proposals: ExpenseProposalRepository,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ExpensesCapitalTriggerService.name);
  }

  @OnEvent('entitysynced::expense::proposals')
  async handleProposalSynced(payload: { entity: ExpenseProposalDomainEntity; blockNum: number }): Promise<void> {
    const { entity, blockNum } = payload;

    if (entity.status !== ExpenseProposalStatus.CLOSED) {
      return;
    }

    if (!entity.total_actual) {
      this.logger.warn(
        `СЗ ${entity.proposal_hash} закрыт без total_actual — capitalization не запускается.`
      );
      return;
    }

    this.logger.log(
      `СЗ ${entity.proposal_hash} закрыт в блоке ${blockNum} (total_actual=${entity.total_actual}, coopname=${entity.coopname}). ` +
        `TODO: вызов capital::createrid (Эпик 0 cooptypes regen + WriteMutationPool).`
    );

    // void this.proposals — заглушка, чтобы proposals не считался unused: после
    // Эпика 0 здесь будет idempotency-check по metadata в БД.
    void this.proposals;
  }
}
