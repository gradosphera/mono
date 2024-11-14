import type { Document } from 'mongoose';

export interface IPluginSchema<T> extends Document {
  name: string;
  enabled: boolean;
  config: T;
}

export interface IPluginLog<T> extends Document {
  name: string;
  log: T;
}
