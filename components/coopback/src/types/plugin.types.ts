import type { Document } from 'mongoose';

export interface IPlugin {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(config: any): Promise<void>;
}

export interface IPluginSchema<T> extends Document {
  name: string;
  enabled: boolean;
  config: T;
}

export interface IPluginLog<T> extends Document {
  name: string;
  log: T;
}
