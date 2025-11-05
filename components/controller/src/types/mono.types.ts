import type { GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';

export type SystemStatusInterface = 'install' | 'initialized' | 'active' | 'maintenance';

export interface IHealthResponse {
  status: SystemStatusInterface;
  blockchain: GetInfoResult;
}
