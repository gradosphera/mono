import { expose } from 'threads/worker';
import mongoose from 'mongoose';
import { PluginRegistry } from '../plugins';
import rootConfig from '../config/config';
import { IPNProvider } from '../services/payment/ipn/ipnProvider';

const initializePlugin = async (pluginName: string, registrationPort: MessagePort) => {
  try {
    await mongoose.connect(rootConfig.mongoose.url);
    const plugin = new PluginRegistry[pluginName].Plugin();

    await plugin.initialize();

    // Проверяем, является ли плагин провайдером платежей
    if (plugin instanceof IPNProvider) {
      registrationPort.postMessage({ type: 'register-provider', name: pluginName, providerInstance: plugin });
    }

    return `Плагин ${pluginName} инициализирован успешно.`;
  } catch (error: any) {
    throw new Error(`Ошибка при инициализации плагина ${pluginName}: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
};

expose({
  initializePlugin,
});
