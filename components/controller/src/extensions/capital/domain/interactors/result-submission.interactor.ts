import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { PushResultDomainInput } from '../actions/push-result-domain-input.interface';
import type { ConvertSegmentDomainInput } from '../actions/convert-segment-domain-input.interface';

/**
 * Интерактор домена для подведения результатов в CAPITAL контракте
 * Обрабатывает действия связанные с внесением результатов и конвертацией сегментов
 */
@Injectable()
export class ResultSubmissionInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Внесение результата в CAPITAL контракте
   */
  async pushResult(data: PushResultDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.PushResult.IPushResult = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      result_hash: data.result_hash,
      contribution_amount: data.contribution_amount,
      debt_amount: data.debt_amount,
      statement: data.statement,
      debt_hashes: data.debt_hashes,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.pushResult(blockchainData);
  }

  /**
   * Конвертация сегмента в CAPITAL контракте
   */
  async convertSegment(data: ConvertSegmentDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.ConvertSegment.IConvertSegment = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      convert_hash: data.convert_hash,
      wallet_amount: data.wallet_amount,
      capital_amount: data.capital_amount,
      project_amount: data.project_amount,
      convert_statement: data.convert_statement,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.convertSegment(blockchainData);
  }
}
