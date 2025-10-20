import type { Queries, Zeus } from '@coopenomics/sdk';

//TODO: заменить здесь и на бэкенде на IExtension
export type IDesktop = Queries.Desktop.GetDesktop.IOutput[typeof Queries.Desktop.GetDesktop.name]

// Тип конфигурации рабочего стола из SDK
export type IDesktopConfig = Zeus.ModelTypes['DesktopConfig']

export interface IWorkspace {
  name: string;
  title: string;
  defaultRoute?: string; // Маршрут по умолчанию для этого рабочего стола
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
  hidden?: boolean;
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
