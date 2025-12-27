import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { DomainToBlockchainUtils } from '../../../shared/utils/domain-to-blockchain.utils';
import { SovietContract } from 'cooptypes';
import type { SystemBlockchainPort } from '~/domain/system/interfaces/system-blockchain.port';
import type { ConvertToAxonInputDomainInterface } from '~/domain/system/interfaces/convert-to-axon-input-domain.interface';
import type { GetInfoResult } from '~/types/shared/blockchain.types';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import Vault from '~/models/vault.model';
import { HttpApiError } from '~/utils/httpApiError';
import httpStatus from 'http-status';

@Injectable()
export class SystemBlockchainAdapter implements SystemBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getInfo(coopname: string): Promise<GetInfoResult> {
    return this.blockchainService.getInfo();
  }

  /**
   * Конвертация RUB в AXON токены
   */
  async convertToAxon(data: ConvertToAxonInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Конвертируем документ в блокчейн формат
    const _blockchainDocument = this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.document);

    // Создаем данные для транзакции согласно интерфейсу действия
    const transactionData: SovietContract.Actions.System.ConvertToAxn.IConvertToAxn = {
      coopname: data.username,
      amount: data.convert_amount, // Сумма в формате "1000.0000 RUB"
      statement: _blockchainDocument,
    };

    // Выполняем транзакцию
    return await this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.System.ConvertToAxn.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: transactionData,
    });
  }
}
