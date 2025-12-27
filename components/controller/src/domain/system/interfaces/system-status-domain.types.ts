import type { GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';

export type SystemStatusDomainType = 'install' | 'initialized' | 'active' | 'maintenance';

export interface IHealthResponse {
  status: SystemStatusDomainType;
  blockchain: GetInfoResult;
}
