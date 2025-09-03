// domain/ledger/services/ledger-event.service.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LedgerDomainInteractor } from '../interactors/ledger.interactor';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { LedgerContract } from 'cooptypes';
import type { IAction } from '~/types';

/**
 * Сервис обработки событий ledger операций
 * Подписывается на события из внутренней шины и вызывает соответствующий интерактор
 */
@Injectable()
export class LedgerEventService {
  constructor(private readonly ledgerInteractor: LedgerDomainInteractor, private readonly logger: WinstonLoggerService) {
    this.logger.setContext(LedgerEventService.name);
  }

  /**
   * Обработчик события операции debet из блокчейна
   */
  @OnEvent(`action::${LedgerContract.contractName.production}::${LedgerContract.Actions.Add.actionName}`)
  async handleLedgerDebet(event: IAction): Promise<void> {
    await this.handleLedgerOperation(event);
  }

  /**
   * Обработчик события операции credit из блокчейна
   */
  @OnEvent(`action::${LedgerContract.contractName.production}::${LedgerContract.Actions.Sub.actionName}`)
  async handleLedgerCredit(event: IAction): Promise<void> {
    await this.handleLedgerOperation(event);
  }

  /**
   * Обработчик события операции block из блокчейна
   */
  @OnEvent(`action::${LedgerContract.contractName.production}::${LedgerContract.Actions.Block.actionName}`)
  async handleLedgerBlock(event: IAction): Promise<void> {
    await this.handleLedgerOperation(event);
  }

  /**
   * Обработчик события операции unblock из блокчейна
   */
  @OnEvent(`action::${LedgerContract.contractName.production}::${LedgerContract.Actions.Unblock.actionName}`)
  async handleLedgerUnblock(event: IAction): Promise<void> {
    await this.handleLedgerOperation(event);
  }

  /**
   * Обработчик события операции writeoff из блокчейна
   */
  @OnEvent(`action::${LedgerContract.contractName.production}::${LedgerContract.Actions.Writeoff.actionName}`)
  async handleLedgerWriteoff(event: IAction): Promise<void> {
    await this.handleLedgerOperation(event);
  }

  /**
   * Обработчик события операции writeoffcnsl из блокчейна
   */
  @OnEvent(`action::${LedgerContract.contractName.production}::${LedgerContract.Actions.WriteoffCnsl.actionName}`)
  async handleLedgerWriteoffCnsl(event: IAction): Promise<void> {
    await this.handleLedgerOperation(event);
  }

  /**
   * Общий обработчик операций ledger
   */
  private async handleLedgerOperation(event: IAction): Promise<void> {
    try {
      await this.ledgerInteractor.processLedgerEvent(event);
      this.logger.info(`Ledger operation processed successfully: ${event.name}`, {
        action: event.name,
        coopname: event.data.coopname,
        global_sequence: event.global_sequence,
      });
    } catch (error: any) {
      this.logger.error(`Failed to process ledger operation: ${error.message}`, error.stack);
      // Не перебрасываем ошибку - событие уже обработано
    }
  }
}
