import { Injectable } from '@nestjs/common';
import { LedgerDomainInteractor } from '~/domain/ledger/interactors/ledger.interactor';
import type { GetLedgerInputDTO } from '../dto/get-ledger-input.dto';
import type { LedgerStateDTO } from '../dto/ledger-state.dto';

/**
 * Сервис приложения для работы с ledger
 * Координирует взаимодействие между GraphQL слоем и доменом
 */
@Injectable()
export class LedgerService {
  constructor(private readonly ledgerDomainInteractor: LedgerDomainInteractor) {}

  /**
   * Получить состояние ledger кооператива
   */
  async getLedger(data: GetLedgerInputDTO): Promise<LedgerStateDTO> {
    // Передаем данные в доменный интерактор
    const ledgerState = await this.ledgerDomainInteractor.getLedger(data);

    // Возвращаем результат (DTO уже имплементирует доменный интерфейс)
    return ledgerState;
  }
}
