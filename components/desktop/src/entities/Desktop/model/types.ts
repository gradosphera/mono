import type { Queries } from '@coopenomics/sdk';

export type IDesktop = Queries.Desktop.GetDesktop.IOutput[typeof Queries.Desktop.GetDesktop.name]
export interface ILegacyDesktop {
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
  conditions: string;
}

export interface IRoute {
  path: string;
  name: string;
  component?: any;
  children?: IRoute[];
  meta: RouteMeta;
}

export type { IHealthResponse } from '@coopenomics/controller'

export interface IBackNavigationButton {
  text: string
  onClick: () => void
  componentId: string
}

export interface IDesktopWithNavigation extends IDesktop {
  backNavigationButton: IBackNavigationButton | null
}
