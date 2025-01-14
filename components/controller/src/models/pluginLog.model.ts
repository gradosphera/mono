import { Schema, model, type Model } from 'mongoose';
import type { IPluginLog } from '../types/plugin.types';
import { paginate, toJSON } from './plugins';

interface IPaginate extends Model<IPluginLog<any>> {
  paginate(filter, options): any;
}

export const pluginLog = new Schema<IPluginLog<any>, IPaginate>(
  {
    name: { type: String, required: true },
    log: { type: Schema.Types.Mixed }, // Своя конфигурация для каждого плагина
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
pluginLog.plugin(toJSON);
pluginLog.plugin(paginate);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginLog = model<IPluginLog<any>, IPaginate>('PluginLogs', pluginLog);
