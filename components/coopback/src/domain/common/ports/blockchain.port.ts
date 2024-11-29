import type { IndexPosition } from '~/infrastructure/blockchain/blockchain.service';

// domain/common/ports/blockchain.port.ts
export interface BlockchainPort {
  initialize(username: string, wif: string): void;
  transact(actionOrActions: any | any[], broadcast?: boolean): Promise<any>;
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
