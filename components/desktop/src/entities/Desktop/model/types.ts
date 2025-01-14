export interface IDesktop {
  name: string;
  hash: string;
  authorizedHome: string;
  nonAuthorizedHome: string;
  routes: IRoute[];
  config: object;
}

export interface IBlockchainDesktops {
  defaultHash: string; //hash
  availableHashes: string[]; //hashes
}

interface RouteMeta {
  title: string;
  icon: string;
  roles: string[];
}

export interface IRoute {
  path: string;
  name: string;
  component?: any;
  children?: IRoute[];
  meta: RouteMeta;
}

export type { IHealthResponse } from '@coopenomics/controller'
