import type { GetInfoResult } from '~/types/shared/blockchain.types';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { ConvertToAxonInputDomainInterface } from './convert-to-axon-input-domain.interface';

export interface SystemBlockchainPort {
  getInfo(coopname: string): Promise<GetInfoResult>;
  convertToAxon(data: ConvertToAxonInputDomainInterface): Promise<TransactionResult>;
}

export const SYSTEM_BLOCKCHAIN_PORT = Symbol('SystemBlockchainPort');
