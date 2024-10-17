import { Schema, model } from 'mongoose';
import type { IPluginSchema } from '../types/plugin.types';

const pluginSchema = new Schema({
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  config: { type: Schema.Types.Mixed }, // Своя конфигурация для каждого плагина
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginConfig = model<IPluginSchema<any>>('Plugins', pluginSchema);
