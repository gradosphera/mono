import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { ImportContributorDomainInput } from '../actions/import-contributor-domain-input.interface';
import type { RegisterContributorDomainInput } from '../actions/register-contributor-domain-input.interface';
import type { MakeClearanceDomainInput } from '../actions/make-clearance-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';

/**
 * Интерактор домена для управления участием в CAPITAL контракте
 * Обрабатывает действия связанные с вкладчиками и их регистрацией
 */
@Injectable()
export class ParticipationManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  async importContributor(data: ImportContributorDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.ImportContributor.IImportContributor = {
      coopname: data.coopname,
      username: data.username,
      contributor_hash: data.contributor_hash,
      contribution_amount: data.contribution_amount,
      memo: data.memo,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.importContributor(blockchainData);
  }

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.RegisterContributor.IRegisterContributor = {
      coopname: data.coopname,
      username: data.username,
      contributor_hash: data.contributor_hash,
      rate_per_hour: data.rate_per_hour,
      is_external_contract: data.is_external_contract,
      contract: data.contract,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.registerContributor(blockchainData);
  }

  /**
   * Подписание приложения в CAPITAL контракте
   */
  async makeClearance(data: MakeClearanceDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.GetClearance.IGetClearance = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      appendix_hash: data.appendix_hash,
      document: data.document,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.makeClearance(blockchainData);
  }
}
