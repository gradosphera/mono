import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { BaseDocumentAdapter } from './base-document.adapter';
import { OneCoopDocumentAction } from '../enums/oneccoop-document-action.enum';
import type { JoinCoopDataInterface } from '../interfaces/joincoop-data.interface';
import type { OneCoopDocumentOutputInterface } from '../interfaces/oneccoop-document-output.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import { ACCOUNT_DATA_PORT, AccountDataPort } from '~/domain/account/ports/account-data.port';
import { OneCoopBlockchainService } from '../../infrastructure/services/oneccoop-blockchain.service';

/**
 * Адаптер для обработки документов вступления в кооператив (joincoop)
 * Извлекает данные о пайщике и суммах взносов для передачи в 1С
 */
@Injectable()
export class JoinCoopDocumentAdapter extends BaseDocumentAdapter<JoinCoopDataInterface> {
  readonly action = OneCoopDocumentAction.JOINCOOP;

  constructor(
    @Inject(ACCOUNT_DATA_PORT)
    private readonly accountPort: AccountDataPort,
    @Inject(forwardRef(() => OneCoopBlockchainService))
    private readonly blockchainService: OneCoopBlockchainService
  ) {
    super();
  }

  async adapt(
    packageAggregate: DocumentPackageAggregateDomainInterface,
    blockNum: number
  ): Promise<OneCoopDocumentOutputInterface<JoinCoopDataInterface> | null> {
    const statement = packageAggregate.statement;
    if (!statement) return null;

    const documentAggregate = statement.documentAggregate;
    if (!documentAggregate) return null;

    const meta = documentAggregate.document.meta;
    if (!meta) return null;

    const username = meta.username;
    const coopname = meta.coopname;

    if (!username || !coopname) return null;

    // Получаем данные аккаунта для определения типа
    const account = await this.accountPort.getAccount(username);
    if (!account.provider_account) return null;

    const accountType = this.getAccountType(account.provider_account);

    // Получаем данные кооператива для извлечения сумм взносов
    const coopData = await this.blockchainService.getCooperativeData(coopname, blockNum);

    // Определяем суммы взносов в зависимости от типа аккаунта
    let initialContribution: number;
    let minimumContribution: number;

    if (accountType === 'organization') {
      // Для юридических лиц используем org_initial и org_minimum
      initialContribution = this.parseAssetValue(coopData.org_initial);
      minimumContribution = this.parseAssetValue(coopData.org_minimum);
    } else {
      // Для физических лиц и ИП используем initial и minimum
      initialContribution = this.parseAssetValue(coopData.initial);
      minimumContribution = this.parseAssetValue(coopData.minimum);
    }

    // Получаем полное имя пайщика
    const fullName = await this.accountPort.getDisplayName(username);

    // Формируем хеш документа
    const hash = documentAggregate.hash || '';

    // Получаем хеш пакета из action
    const packageHash = statement.action?.data?.package || '';

    return {
      action: this.action,
      block_num: blockNum,
      package: packageHash,
      hash,
      data: {
        username,
        account_type: accountType,
        full_name: fullName,
        initial_contribution: initialContribution,
        minimum_contribution: minimumContribution,
        created_at: meta.created_at || '',
      },
    };
  }

  /**
   * Определяет тип аккаунта по данным AccountDomainEntity
   */
  private getAccountType(account: { type?: string }): 'individual' | 'entrepreneur' | 'organization' {
    const type = account.type;

    if (type === 'organization') return 'organization';
    if (type === 'entrepreneur') return 'entrepreneur';

    return 'individual';
  }
}
