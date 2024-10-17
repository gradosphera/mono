import { PluginConfig } from '../models/plugin.model';
import { IPlugin } from '../types/plugin.types';
import { Powerup } from '../plugins/powerup';
import type { Application } from 'express';

const defaultPlugins = [{ name: 'Powerup', enabled: true, config: { optionA: true } }];

export const initializeDefaultPlugins = async () => {
  for (const plugin of defaultPlugins) {
    const existingPlugin = await PluginConfig.findOne({ name: plugin.name });
    if (!existingPlugin) {
      await PluginConfig.create(plugin);
      console.log(`Дефолтный плагин ${plugin.name} добавлен в базу.`);
    }
  }
};

// Доступные плагины
const availablePlugins: { [key: string]: IPlugin } = {
  Powerup: new Powerup(),
};

export const pluginFactory = async (app: Application) => {
  // Загрузка всех активных плагинов из базы данных
  const plugins = await PluginConfig.find({ enabled: true });

  for (const pluginData of plugins) {
    const plugin = availablePlugins[pluginData.name];
    if (plugin) {
      await plugin.initialize(app, pluginData.config);
      console.log(`Плагин ${plugin.name} инициализирован.`);
    } else {
      console.log(`Плагин ${pluginData.name} не найден.`);
    }
  }
};
