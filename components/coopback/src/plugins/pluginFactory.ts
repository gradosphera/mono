import { PluginConfig } from '../models/pluginConfig.model';
import { registerProvider } from '../services/payment.service';
import { PluginRegistry } from '.';
import { PaymentProvider } from '../services/payment/paymentProvider';

// Объект для хранения запущенных плагинов
const workerMap: { [key: string]: { pluginInstance: any } } = {};

// Фабрика для инициализации всех активных плагинов
export const pluginFactory = async () => {
  const plugins = await PluginConfig.find({ enabled: true });

  for (const pluginData of plugins) {
    // Инициализируем только если плагин еще в реестре
    if (PluginRegistry[pluginData.name]) {
      await initializeWorkerByName(pluginData.name);
    }
  }
};

// Функция для завершения плагина по имени
export const terminateWorker = async (pluginName: string) => {
  const workerData = workerMap[pluginName];
  if (workerData) {
    delete workerMap[pluginName]; // Удаляем плагин из карты
    console.log(`Плагин ${pluginName} завершен.`);
  } else {
    console.log(`Плагин ${pluginName} не найден.`);
  }
};

// Функция для инициализации плагина по имени
export const initializeWorkerByName = async (pluginName: string) => {
  if (workerMap[pluginName]) {
    console.log(`Плагин ${pluginName} уже запущен.`);
    return;
  }

  const pluginData = await PluginConfig.findOne({ name: pluginName });
  if (!pluginData || !pluginData.enabled) {
    console.log(`Плагин ${pluginName} не найден или отключен.`);
    return;
  }

  // Получаем класс плагина из реестра и создаем его экземпляр
  const PluginClass = PluginRegistry[pluginName].Plugin;
  const pluginInstance = new PluginClass();

  // Инициализируем плагин (если требуется асинхронная инициализация)
  if (typeof pluginInstance.initialize === 'function') {
    await pluginInstance.initialize();
  }

  // Проверка на IPNProvider и регистрация, если является провайдером платежей
  if (pluginInstance instanceof PaymentProvider) {
    registerProvider(pluginName, pluginInstance);
    console.log(`Платежный провайдер ${pluginName} успешно зарегистрирован.`);
  }

  // Сохраняем инстанс в workerMap
  workerMap[pluginName] = { pluginInstance };

  console.log(`Плагин ${pluginName} успешно запущен.`);
};

// Функция для перезагрузки плагина по имени
export const restartWorker = async (pluginName: string) => {
  const workerData = workerMap[pluginName];

  if (workerData) {
    // Если плагин уже запущен, сначала завершаем его
    console.log(`Перезагрузка плагина ${pluginName}...`);
    await terminateWorker(pluginName);
  }

  // Затем запускаем плагин заново
  await initializeWorkerByName(pluginName);
  console.log(`Плагин ${pluginName} перезагружен.`);
};
