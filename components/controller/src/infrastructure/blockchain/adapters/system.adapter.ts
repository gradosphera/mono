import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { DomainToBlockchainUtils } from '../../../shared/utils/domain-to-blockchain.utils';
import type { SystemBlockchainPort, ConvertToAxonDomainInterface } from '~/domain/system/interfaces/system-blockchain.port';
import type { GetInfoResult } from '~/types/shared/blockchain.types';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';

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
   * Конвертация паевого взноса в членский взнос (заглушка)
   * TODO: Реализовать вызов блокчейн-транзакции для конвертации
   */
  async convertToAxon(data: ConvertToAxonDomainInterface): Promise<TransactionResult> {
    // Конвертируем документ в блокчейн формат
    const _blockchainDocument = this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.document);

    // Заглушка для будущей реализации
    // Здесь будет вызов блокчейн-контракта для конвертации паевого взноса в членский взнос
    // Пример:
    // const result = await this.blockchainService.transact({
    //   account: 'system', // или соответствующий контракт
    //   name: 'converttoaxon', // имя действия
    //   authorization: [{ actor: data.coopname, permission: 'active' }],
    //   data: {
    //     coopname: data.coopname,
    //     username: data.username,
    //     document: _blockchainDocument,
    //     convert_amount: data.convert_amount,
    //   },
    // });

    throw new Error('Метод convertToAxon еще не реализован - требуется реализация контракта конвертации');
  }
}
