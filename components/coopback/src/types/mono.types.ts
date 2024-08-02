import { GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';

export type IHealthStatus = 'install' | 'active' | 'maintenance';

export interface IHealthResponse {
  status: IHealthStatus;
  blockchain: GetInfoResult;
}
