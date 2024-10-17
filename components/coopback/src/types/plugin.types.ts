import type { Application } from 'express';

export interface IPlugin {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(app: Application, config: any): Promise<void>;
}

export interface IPluginSchema<T> {
  name: string;
  enabled: boolean;
  config: T;
}
