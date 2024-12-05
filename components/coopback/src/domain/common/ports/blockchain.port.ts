import type { IndexPosition } from '~/infrastructure/blockchain/blockchain.service';
import type { SystemAccountInterface } from '~/types/shared';
import type { GetInfoResult } from '~/types/shared/blockchain.types';

// domain/common/ports/blockchain.port.ts
export interface BlockchainPort {
  initialize(username: string, wif: string): void;
  transact(actionOrActions: any | any[], broadcast?: boolean): Promise<any>;
  getInfo(): Promise<GetInfoResult>;
  getAccount(name: string): Promise<SystemAccountInterface>;
  getAllRows(code: string, scope: string, tableName: string): Promise<any[]>;
  getSingleRow(
    code: string,
    scope: string,
    tableName: string,
    primaryKey: string | number,
    indexPosition?: IndexPosition
  ): Promise<any | null>;
  query(
    code: string,
    scope: string,
    tableName: string,
    options: {
      indexPosition?: IndexPosition;
      from?: string | number;
      to?: string | number;
      maxRows?: number;
    }
  ): Promise<any[]>;
}

export const BLOCKCHAIN_PORT = Symbol('BlockchainPort');
