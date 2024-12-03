import type { BlockchainInfoInterface } from '~/types/shared';

export interface SystemBlockchainPort {
  getInfo(coopname: string): Promise<BlockchainInfoInterface>;
}

export const SYSTEM_BLOCKCHAIN_PORT = Symbol('SystemBlockchainPort');
