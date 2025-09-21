import cron from 'node-cron';
import { blockchainService } from '../../services';
import { default as coopConfig } from '../../config/config';
import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import {
  LOG_EXTENSION_REPOSITORY,
  LogExtensionDomainRepository,
} from '~/domain/extension/repositories/log-extension-domain.repository';
import { z } from 'zod';
import type { DeserializedDescriptionOfExtension } from '~/types/shared';

// Функция для проверки и сериализации FieldDescription
function describeField(description: DeserializedDescriptionOfExtension): string {
  return JSON.stringify(description);
}

// Дефолтные параметры конфигурации
export const defaultConfig = {
  dailyPackageSize: 5,
  topUpAmount: 5,
  systemSymbol: 'AXON',
  systemPrecision: 4,
  thresholds: {
    cpu: 5000,
    net: 1024,
    ram: 10240,
  },
  lastDailyReplenishmentDate: '',
};

// Определение Zod-схемы
export const Schema = z.object({
  dailyPackageSize: z
    .number()
    .default(defaultConfig.dailyPackageSize)
    .describe(
      describeField({
        label: 'Сумма автоматической ежедневной аренды квот вычислительных ресурсов',
        note: `Минимум: 5 ${defaultConfig.systemSymbol}. Пополняет автоматически каждый день вычислительные ресурсы кооператива на указанную сумму токенов.`,
        rules: ['val >= 5'],
        prepend: defaultConfig.systemSymbol,
      })
    ),
  topUpAmount: z
    .number()
    .default(defaultConfig.topUpAmount)
    .describe(
      describeField({
        label: 'Сумма экстренного пополнения при достижении минимального порога квот',
        rules: ['val > 0'],
        prepend: defaultConfig.systemSymbol,
        note: `На эту сумму происходит автоматическое пополнение, когда любой из ресурсов (CPU, NET или RAM) выходит за пределы минимальной квоты.`,
      })
    ),
  thresholds: z.object({
    cpu: z
      .number()
      .default(defaultConfig.thresholds.cpu)
      .describe(
        describeField({
          label: 'Минимальный остаток квоты CPU',
          note: 'Если количество CPU аккаунта кооператива становится меньше указанного значения, происходит автоматическое пополнение ресурсов на экстренную сумму.',
          prepend: 'CPU',
          append: 'ms',
          rules: ['val >= 0'],
        })
      ),
    net: z
      .number()
      .default(defaultConfig.thresholds.net)
      .describe(
        describeField({
          label: 'Минимальный остаток квоты NET',
          note: 'Если количество NET аккаунта кооператива становится меньше указанного значения, происходит автоматическое пополнение ресурсов на экстренную сумму.',
          prepend: 'NET',
          append: 'bytes',
          rules: ['val >= 0'],
        })
      ),
    ram: z
      .number()
      .default(defaultConfig.thresholds.ram)
      .describe(
        describeField({
          label: 'Минимальный остаток квоты RAM',
          note: 'Если количество RAM аккаунта кооператива становится меньше указанного значения, происходит автоматическое пополнение ресурсов на экстренную сумму.',
          prepend: 'RAM',
          append: 'bytes',
          rules: ['val >= 0'],
        })
      ),
  }),
  lastDailyReplenishmentDate: z
    .string()
    .default(defaultConfig.lastDailyReplenishmentDate)
    .describe(
      describeField({ label: 'Дата последнего ежедневного пополнения', visible: false, minLength: 10, maxLength: 10 })
    ),
  systemPrecision: z
    .number()
    .default(defaultConfig.systemPrecision)
    .describe(describeField({ label: 'Точность системного утилити-токена', visible: false })),
  systemSymbol: z
    .string()
    .default(defaultConfig.systemSymbol)
    .describe(
      describeField({ label: 'Символ системного утилити-токена', visible: false, minLength: 3, maxLength: 5, maxRows: 4 })
    ),
});

// Автоматическое создание типа IConfig на основе Zod-схемы
export type IConfig = z.infer<typeof Schema>;

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

export class PowerupPlugin extends BaseExtModule implements OnModuleDestroy {
  private dailyCronJob: cron.ScheduledTask | null = null;
  private resourceCronJob: cron.ScheduledTask | null = null;

  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(LOG_EXTENSION_REPOSITORY) private readonly logExtensionRepository: LogExtensionDomainRepository<ILog>,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(PowerupPlugin.name);
  }

  name = 'powerup';
  plugin!: ExtensionDomainEntity<IConfig>;

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  async initialize() {
    const pluginData = await this.extensionRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin.config);

    // Проверяем, было ли ежедневное пополнение в последние 24 часа
    const lastDate = this.plugin.config.lastDailyReplenishmentDate
      ? new Date(this.plugin.config.lastDailyReplenishmentDate)
      : null;

    const now = new Date();

    if (lastDate) {
      const diffInHours = Math.abs(now.getTime() - lastDate.getTime()) / 36e5; // Разница во времени в часах
      if (diffInHours < 24) {
        this.logger.info('Ежедневное пополнение уже выполнялось в последние 24 часа. Повторное пополнение не требуется.');
      } else {
        this.logger.info('Ежедневное пополнение не выполнялось в последние 24 часа. Выполняем пополнение...');
        await this.runDailyTask();
      }
    } else {
      this.logger.info('Дата последнего пополнения отсутствует. Выполняем пополнение...');
      await this.runDailyTask();
    }

    // Регистрация cron-задачи для ежедневного пополнения
    this.dailyCronJob = cron.schedule('0 0 * * *', () => {
      this.logger.info('Запуск ежедневной задачи пополнения');
      this.runDailyTask();
    });

    // Регистрация cron-задачи для проверки ресурсов каждую минуту
    this.resourceCronJob = cron.schedule('* * * * *', () => {
      this.runTask();
    });
  }

  onModuleDestroy() {
    if (this.dailyCronJob) {
      this.dailyCronJob.stop();
      this.dailyCronJob = null;
      this.logger.info('node-cron задача ежедневного пополнения остановлена');
    }

    if (this.resourceCronJob) {
      this.resourceCronJob.stop();
      this.resourceCronJob = null;
      this.logger.info('node-cron задача проверки ресурсов остановлена');
    }
  }

  private getQuantity(amount: number): string {
    return `${amount.toFixed(this.plugin.config.systemPrecision)} ${this.plugin.config.systemSymbol}`;
  }

  // Ежедневная задача пополнения
  private async runDailyTask() {
    const quantity = this.getQuantity(this.plugin.config.dailyPackageSize);

    this.logger.info(`Выполнение ежедневного пополнения на сумму ${quantity}`);

    try {
      // Получаем имя пользователя из окружения или другой конфигурации
      const username = coopConfig.coopname;
      const account = await blockchainService.getBlockchainAccount(username);

      await blockchainService.powerUp(username, quantity);

      this.plugin.config.lastDailyReplenishmentDate = new Date().toISOString();
      await this.extensionRepository.update(this.plugin);

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

      this.logger.info('Ежедневное пополнение выполнено успешно');
    } catch (error) {
      console.error('Ошибка при выполнении ежедневного пополнения:', error);
    }
  }

  private async log(action: ILog) {
    await this.logExtensionRepository.push(this.name, action);
  }

  // Задача проверки и пополнения ресурсов
  private async runTask() {
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

      if (cpuLimit.available <= this.plugin.config.thresholds.cpu) {
        this.logger.info(`CPU квота ниже порога (${cpuLimit.available} µs).`);
        needPowerUp = true;
      }

      if (netLimit.available <= this.plugin.config.thresholds.net) {
        this.logger.info(`NET квота ниже порога (${netLimit.available} bytes).`);
        needPowerUp = true;
      }

      if (availableRam <= this.plugin.config.thresholds.ram) {
        this.logger.info(`RAM квота ниже порога (${availableRam} bytes).`);
        needPowerUp = true;
      }

      if (needPowerUp) {
        // Выполняем пополнение ресурсов
        const quantity = this.getQuantity(this.plugin.config.topUpAmount);
        await blockchainService.powerUp(username, quantity);
        this.logger.info(`Пополнение выполнено на сумму ${quantity}.`);

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
        //ничего не делаем
      }
    } catch (error) {
      console.error('Ошибка при проверке и пополнении ресурсов:', error);
    }
  }
}

@Module({
  providers: [PowerupPlugin], // Регистрируем PowerupPlugin как провайдер
  exports: [PowerupPlugin], // Экспортируем его для доступа в других модулях
})
export class PowerupPluginModule {
  constructor(private readonly powerupPlugin: PowerupPlugin) {}

  async initialize() {
    await this.powerupPlugin.initialize();
  }
}
