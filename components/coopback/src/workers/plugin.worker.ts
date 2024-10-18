import { expose } from 'threads/worker';
import mongoose from 'mongoose';
import { PluginRegistry } from '../plugins';
import rootConfig from '../config/config';

const initializePlugin = async (pluginName: string, config: any) => {
  try {
    // Устанавливаем соединение с базой данных
    await mongoose.connect(rootConfig.mongoose.url);

    const plugin = new PluginRegistry[pluginName].Plugin();
    await plugin.initialize(config);

    return `Плагин ${pluginName} инициализирован успешно.`;
  } catch (error: any) {
    throw new Error(`Ошибка при инициализации плагина ${pluginName}: ${error.message}`);
  } finally {
    // Закрываем соединение с базой данных
    await mongoose.disconnect();
  }
};

// Экспортируем функцию для вызова из основного потока
expose({
  initializePlugin,
});
