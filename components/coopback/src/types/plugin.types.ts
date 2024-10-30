import type Joi from 'joi';
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

export interface IPlugin<T> {
  name: string;
  plugin: IPluginSchema<T>;
  configSchemas: Joi.ObjectSchema<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(config: any): Promise<void>;
}
