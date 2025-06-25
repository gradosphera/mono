import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { WalletContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type {
  WalletBlockchainPort,
  CreateWithdrawDomainInterface,
  GenerateReturnStatementDomainInterface,
} from '~/domain/wallet/ports/wallet-blockchain.port';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import { DomainToBlockchainUtils } from '../utils/domain-to-blockchain.utils';

/**
 * Блокчейн адаптер для wallet
 * Реализует взаимодействие с контрактом wallet
 */
@Injectable()
export class WalletBlockchainAdapter implements WalletBlockchainPort {
  private readonly logger = new Logger(WalletBlockchainAdapter.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  /**
   * Создание заявки на вывод средств в контракте wallet
   */
  async createWithdraw(data: CreateWithdrawDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Форматируем quantity к необходимой точности для блокчейна
    const formattedQuantity = this.domainToBlockchainUtils.formatQuantityWithPrecision(data.quantity);

    // Преобразуем доменные данные в формат cooptypes контракта
    const blockchainData: WalletContract.Actions.CreateWithdraw.ICreateWithdraw = {
      coopname: data.coopname,
      username: data.username,
      withdraw_hash: data.withdraw_hash,
      quantity: formattedQuantity,
      statement: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.statement),
    };

    const result = (await this.blockchainService.transact({
      account: WalletContract.contractName.production,
      name: WalletContract.Actions.CreateWithdraw.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    this.logger.log(`Создана заявка на вывод средств: ${data.withdraw_hash}`);
    return result;
  }

  /**
   * Генерация заявления на возврат паевого взноса
   */
  async generateReturnStatement(_data: GenerateReturnStatementDomainInterface): Promise<ISignedDocumentDomainInterface> {
    // TODO: Реализовать генерацию заявления через документный сервис
    // Пока возвращаем заглушку
    throw new Error('Метод generateReturnStatement еще не реализован');
  }

  /**
   * Получение данных из wallet контракта
   */
  async getWithdraw(coopname: string, withdraw_hash: string): Promise<WalletContract.Tables.Withdraws.IWithdraws | null> {
    try {
      const withdraws = await this.blockchainService.query(
        WalletContract.contractName.production,
        coopname,
        WalletContract.Tables.Withdraws.tableName,
        {
          indexPosition: 'secondary',
          from: withdraw_hash,
          to: withdraw_hash,
        }
      );

      return withdraws.length > 0 ? withdraws[0] : null;
    } catch (error: any) {
      this.logger.warn(`Не удалось получить withdraw ${withdraw_hash} для ${coopname}: ${error.message}`);
      return null;
    }
  }

  /**
   * Получение всех withdrawals для кооператива
   */
  async getWithdraws(coopname: string): Promise<WalletContract.Tables.Withdraws.IWithdraws[]> {
    return this.blockchainService.getAllRows(
      WalletContract.contractName.production,
      coopname,
      WalletContract.Tables.Withdraws.tableName
    );
  }
}
