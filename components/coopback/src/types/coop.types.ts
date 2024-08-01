import { GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';

export interface IHealthResponse {
  status;
  blockchain: GetInfoResult;
}
