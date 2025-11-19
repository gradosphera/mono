import type { GetInfoResult } from '~/types/shared/blockchain.types';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface ConvertToAxonDomainInterface {
  coopname: string;
  username: string;
  document: ISignedDocumentDomainInterface;
  convert_amount: string;
}

export interface SystemBlockchainPort {
  getInfo(coopname: string): Promise<GetInfoResult>;
  convertToAxon(data: ConvertToAxonDomainInterface): Promise<TransactionResult>;
}

export const SYSTEM_BLOCKCHAIN_PORT = Symbol('SystemBlockchainPort');
