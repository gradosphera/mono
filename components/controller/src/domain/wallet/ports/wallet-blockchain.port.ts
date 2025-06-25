import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { WalletContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменные интерфейсы для входных данных wallet блокчейн адаптера
 */
export interface CreateWithdrawDomainInterface {
  coopname: string;
  username: string;
  withdraw_hash: string;
  quantity: string;
  statement: ISignedDocumentDomainInterface;
}

export interface GenerateReturnStatementDomainInterface {
  coopname: string;
  username: string;
  quantity: string;
  symbol: string;
  method_id: string;
  memo?: string;
}

/**
 * Порт для взаимодействия с wallet блокчейном
 */
export interface WalletBlockchainPort {
  // Создание заявки на вывод средств в wallet контракте
  createWithdraw(data: CreateWithdrawDomainInterface): Promise<TransactionResult>;

  // Генерация заявления на возврат паевого взноса
  generateReturnStatement(data: GenerateReturnStatementDomainInterface): Promise<ISignedDocumentDomainInterface>;

  // Получение данных из wallet контракта
  getWithdraw(coopname: string, withdraw_hash: string): Promise<WalletContract.Tables.Withdraws.IWithdraws | null>;

  // Получение всех withdrawals для кооператива
  getWithdraws(coopname: string): Promise<WalletContract.Tables.Withdraws.IWithdraws[]>;
}

export const WALLET_BLOCKCHAIN_PORT = Symbol('WALLET_BLOCKCHAIN_PORT');
