import { Schema, model, type Model } from 'mongoose';
import type { IPluginSchema } from '../types/plugin.types';
import { paginate, toJSON } from './plugins';

interface IPaginate extends Model<IPluginSchema<any>> {
  paginate(filter, options): any;
}

const pluginSchema = new Schema<IPluginSchema<any>, IPaginate>({
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  config: { type: Schema.Types.Mixed }, // Своя конфигурация для каждого плагина
});

// add plugin that converts mongoose to json
pluginSchema.plugin(toJSON);
pluginSchema.plugin(paginate);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginConfig = model<IPluginSchema<any>, IPaginate>('Plugins', pluginSchema);
