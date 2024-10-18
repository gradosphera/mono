import { IPlugin } from '../../types/plugin.types';
import Joi from 'joi';
import cron from 'node-cron';

// Интерфейс для параметров конфигурации плагина A
export interface IConfig {
  optionA: boolean;
}

export class Plugin implements IPlugin {
  name = 'powerup';

  public pluginSchema = Joi.object<IConfig>({
    optionA: Joi.boolean().required(),
  });

  async initialize(config: IConfig) {
    console.log(`Инициализация ${this.name} с конфигурацией`, config);

    // Запуск cron-задачи сразу при инициализации
    this.runTask();

    // Добавляем лог для проверки регистрации cron-задачи
    console.log('Регистрация cron-задачи');

    // Запуск cron-задачи раз в минуту
    cron.schedule('* * * * *', () => {
      console.log('Запуск cron-задачи');
      this.runTask();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
  }

  private runTask() {
    console.log(`Задача плагина ${this.name} выполняется...`);
  }
}
