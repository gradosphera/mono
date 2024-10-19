import { IPlugin, type IPluginLog, type IPluginSchema } from '../../types/plugin.types';
import Joi from 'joi';
import cron from 'node-cron';
import { blockchainService } from '../../services';
import logger from '../../config/logger';
import { default as coopConfig } from '../../config/config';
import { PluginConfig } from '../../models/pluginConfig.model';
import { PluginLog } from '../../models/pluginLog.model';
import type { IGetPluginConfig } from '../../types';
import type { Document, Types } from 'mongoose';

// Интерфейс для параметров конфигурации плагина powerup
export interface IConfig {
  dailyPackageSize: number; // Размер ежедневного пакета в AXON
  topUpAmount: number; // Сумма пополнения при достижении порога (в AXON)
  systemSymbol: string;
  systemPrecision: number;
  lastDailyReplenishmentDate: Date;
  thresholds: {
    cpu: number; // Порог CPU в микросекундах
    net: number; // Порог NET в байтах
    ram: number; // Порог RAM в байтах
  };
}

export interface ILog {
  type: 'daily' | 'now';
  amount: string;
  resources: {
    username: string;
    ram_usage: any;
    ram_quota: any;
    net_limit: any;
    cpu_limit: any;
  };
}

export class Plugin implements IPlugin {
  name = 'powerup';
  data!: IPluginSchema<IConfig>;

  public pluginSchema = Joi.object<IConfig>({
    dailyPackageSize: Joi.number().required(),
    topUpAmount: Joi.number().required(),
    thresholds: Joi.object({
      cpu: Joi.number().required(),
      net: Joi.number().required(),
      ram: Joi.number().required(),
    }).required(),
  });

  async initialize() {
    const pluginData = await PluginConfig.findOne({ name: this.name });
    if (!pluginData) throw new Error('Конфиг не найден');

    this.data = pluginData;

    logger.info(`Инициализация ${this.name} с конфигурацией`, this.data);

    // Проверяем, было ли ежедневное пополнение в последние 24 часа
    const lastDate = this.data.config.lastDailyReplenishmentDate;
    const now = new Date();

    if (lastDate) {
      const diffInHours = Math.abs(now.getTime() - lastDate.getTime()) / 36e5; // Разница во времени в часах
      if (diffInHours < 24) {
        logger.info('Ежедневное пополнение уже выполнялось в последние 24 часа. Повторное пополнение не требуется.');
      } else {
        logger.info('Ежедневное пополнение не выполнялось в последние 24 часа. Выполняем пополнение...');
        await this.runDailyTask();
      }
    } else {
      logger.info('Дата последнего пополнения отсутствует. Выполняем пополнение...');
      await this.runDailyTask();
    }

    // Регистрация cron-задачи для ежедневного пополнения
    cron.schedule('0 0 * * *', () => {
      logger.info('Запуск ежедневной задачи пополнения');
      this.runDailyTask();
    });

    // Регистрация cron-задачи для проверки ресурсов каждую минуту
    cron.schedule('* * * * *', () => {
      logger.info('Запуск задачи проверки ресурсов');
      this.runTask();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
  }

  private getQuantity(amount: number): string {
    return `${amount.toFixed(this.data.config.systemPrecision)} ${this.data.config.systemSymbol}`;
  }

  // Ежедневная задача пополнения
  private async runDailyTask() {
    const quantity = this.getQuantity(this.data.config.dailyPackageSize);

    logger.info(`Выполнение ежедневного пополнения на сумму ${quantity}`);

    try {
      // Получаем имя пользователя из окружения или другой конфигурации
      const username = coopConfig.coopname;
      const account = await blockchainService.getBlockchainAccount(username);

      await blockchainService.powerUp(username, quantity);

      this.data.config.lastDailyReplenishmentDate = new Date();

      await this.log({
        type: 'daily',
        amount: quantity,
        resources: {
          username: account.account_name,
          ram_usage: account.ram_usage,
          ram_quota: account.ram_quota,
          net_limit: account.net_limit,
          cpu_limit: account.cpu_limit,
        },
      });

      await this.data.save();

      logger.info('Ежедневное пополнение выполнено успешно');
    } catch (error) {
      console.error('Ошибка при выполнении ежедневного пополнения:', error);
    }
  }

  private async log(action: ILog) {
    await PluginLog.create({ name: this.name, log: action });
  }

  // Задача проверки и пополнения ресурсов
  private async runTask() {
    logger.info(`Задача плагина ${this.name} выполняется...`);

    try {
      // Получаем имя пользователя из окружения или другой конфигурации
      const username = coopConfig.coopname;

      const account = await blockchainService.getBlockchainAccount(username);

      // Получаем текущие значения квот
      const cpuLimit = account.cpu_limit;
      const netLimit = account.net_limit;
      const ramQuota = account.ram_quota;
      const ramUsage = account.ram_usage;
      const availableRam = ramQuota - ramUsage;

      // Проверяем пороги и пополняем при необходимости
      let needPowerUp = false;

      if (cpuLimit.available <= this.data.config.thresholds.cpu) {
        logger.info(`CPU квота ниже порога (${cpuLimit.available} µs).`);
        needPowerUp = true;
      }

      if (netLimit.available <= this.data.config.thresholds.net) {
        logger.info(`NET квота ниже порога (${netLimit.available} bytes).`);
        needPowerUp = true;
      }

      if (availableRam <= this.data.config.thresholds.ram) {
        logger.info(`RAM квота ниже порога (${availableRam} bytes).`);
        needPowerUp = true;
      }

      if (needPowerUp) {
        // Выполняем пополнение ресурсов
        const quantity = this.getQuantity(this.data.config.topUpAmount);
        await blockchainService.powerUp(username, quantity);
        logger.info(`Пополнение выполнено на сумму ${quantity}.`);

        await this.log({
          type: 'now',
          amount: quantity,
          resources: {
            username: account.account_name,
            ram_usage: account.ram_usage,
            ram_quota: account.ram_quota,
            net_limit: account.net_limit,
            cpu_limit: account.cpu_limit,
          },
        });
      } else {
        logger.info('Квоты ресурсов в норме, пополнение не требуется.');
      }
    } catch (error) {
      console.error('Ошибка при проверке и пополнении ресурсов:', error);
    }
  }
}
