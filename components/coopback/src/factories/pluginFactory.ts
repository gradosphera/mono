import { spawn, Thread, Worker } from 'threads';
import { PluginConfig } from '../models/pluginConfig.model';

// Объект для хранения запущенных воркеров
const workerMap: { [key: string]: { worker: any; thread: Worker } } = {};

export const initializeDefaultPlugins = async () => {
  const defaultPlugins = [
    {
      name: 'powerup',
      enabled: true,
      config: {
        dailyPackageSize: 5, // Размер ежедневного пакета в AXON
        topUpAmount: 5, // Сумма пополнения при достижении порога (в AXON)
        systemSymbol: 'AXON',
        systemPrecision: 4,
        thresholds: {
          cpu: 5000, // Порог CPU в микросекундах
          net: 1024, // Порог NET в байтах
          ram: 10240, // Порог RAM в байтах
        },
      },
    },
  ];

  for (const plugin of defaultPlugins) {
    const existingPlugin = await PluginConfig.findOne({ name: plugin.name });
    if (!existingPlugin) {
      await PluginConfig.create(plugin);
      console.log(`Дефолтный плагин ${plugin.name} добавлен в базу.`);
    }
  }
};

export const pluginFactory = async () => {
  const plugins = await PluginConfig.find({ enabled: true });

  for (const pluginData of plugins) {
    await initializeWorkerByName(pluginData.name);
  }
};

// Функция для завершения воркера по имени плагина
export const terminateWorker = async (pluginName: string) => {
  const workerData = workerMap[pluginName];
  if (workerData) {
    await workerData.thread.terminate();
    delete workerMap[pluginName]; // Удаляем воркер из карты
    console.log(`Воркер для плагина ${pluginName} завершен.`);
  } else {
    console.log(`Воркер для плагина ${pluginName} не найден.`);
  }
};

// Функция для инициализации воркера по имени плагина
export const initializeWorkerByName = async (pluginName: string) => {
  // Проверяем, запущен ли уже воркер
  if (workerMap[pluginName]) {
    console.log(`Воркер для плагина ${pluginName} уже запущен.`);
    return;
  }

  // Получаем данные плагина из базы
  const pluginData = await PluginConfig.findOne({ name: pluginName });
  if (!pluginData || !pluginData.enabled) {
    console.log(`Плагин ${pluginName} не найден или отключен.`);
    return;
  }

  // Запускаем новый воркер
  const thread = new Worker('../workers/plugin.worker.ts');
  const worker = spawn(thread, { timeout: 30000 }); // Не используем await, чтобы не блокировать основной поток
  //таймаут выше для локальных машин

  // Сохраняем воркера и поток в объекте по имени плагина
  workerMap[pluginName] = { worker, thread };

  // Воркеры работают в фоне
  worker.then(async (workerInstance) => {
    try {
      const result = await workerInstance.initializePlugin(pluginName);
      console.log(result); // Плагин инициализирован успешно
    } catch (err) {
      console.error(err); // Обработка ошибки
    }
  });

  console.log(`Воркер для плагина ${pluginName} успешно запущен.`);
};

// Функция для перезагрузки воркера по имени плагина
export const restartWorker = async (pluginName: string) => {
  const workerData = workerMap[pluginName];

  if (workerData) {
    // Если воркер уже запущен, сначала завершаем его
    console.log(`Перезагрузка воркера для плагина ${pluginName}...`);
    await terminateWorker(pluginName);
  }

  // Затем запускаем воркер заново
  await initializeWorkerByName(pluginName);
  console.log(`Воркер для плагина ${pluginName} перезагружен.`);
};
