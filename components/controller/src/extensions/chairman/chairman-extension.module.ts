import cron from 'node-cron';
import { Inject, Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import config from '~/config/config';
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
import { SOVIET_BLOCKCHAIN_PORT, SovietBlockchainPort } from '~/domain/common/ports/soviet-blockchain.port';
import { SovietContract } from 'cooptypes';
import { merge } from 'lodash';

// Функция для описания полей в схеме конфигурации
function describeField(description: DeserializedDescriptionOfExtension): string {
  return JSON.stringify(description);
}

// Дефолтные параметры конфигурации
export const defaultConfig = {
  checkInterval: 10,
  lastCheckDate: '',
  cancelApprovedDecisions: false,
};

// Zod-схема для конфигурации
export const Schema = z.object({
  checkInterval: z
    .number()
    .default(defaultConfig.checkInterval)
    .describe(
      describeField({
        label: 'Интервал проверки истекших решений (в минутах)',
        note: 'Минимум: 5 минут',
        rules: ['val >= 5'],
        prepend: 'Каждые',
        append: 'минут',
      })
    ),
  lastCheckDate: z
    .string()
    .default(defaultConfig.lastCheckDate)
    .describe(describeField({ label: 'Дата последней проверки', visible: false })),
  cancelApprovedDecisions: z
    .boolean()
    .default(defaultConfig.cancelApprovedDecisions)
    .describe(
      describeField({
        label: 'Отменять принятые решения с истекшим сроком',
        note: 'Если включено, истекшие принятые решения также будут отменяться',
      })
    ),
});

// Тип конфигурации
export type IConfig = z.infer<typeof Schema>;

// Тип для логирования действий
export interface ILog {
  type: 'check' | 'cancel';
  coopname: string;
  decision_id?: string;
  result?: string;
  timestamp?: string; // Делаем опциональным, так как будет добавляться внутри метода log
}

export class ChairmanPlugin extends BaseExtModule {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(LOG_EXTENSION_REPOSITORY) private readonly logExtensionRepository: LogExtensionDomainRepository<ILog>,
    @Inject(SOVIET_BLOCKCHAIN_PORT) private readonly sovietBlockchainPort: SovietBlockchainPort,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(ChairmanPlugin.name);
  }

  name = 'chairman';
  plugin!: ExtensionDomainEntity<IConfig>;

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  async initialize() {
    const pluginData = await this.extensionRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    // Применяем глубокий мердж дефолтных параметров с существующими
    this.plugin = {
      ...pluginData,
      config: merge({}, defaultConfig, pluginData.config),
    };

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin.config);

    // Проверяем, была ли проверка решений в последнее время
    const lastDate = this.plugin.config.lastCheckDate ? new Date(this.plugin.config.lastCheckDate) : null;

    const now = new Date();

    if (lastDate) {
      const diffInMinutes = Math.abs(now.getTime() - lastDate.getTime()) / 60000; // Разница во времени в минутах
      if (diffInMinutes < this.plugin.config.checkInterval) {
        this.logger.info(
          `Проверка решений уже выполнялась в последние ${this.plugin.config.checkInterval} минут. Повторная проверка не требуется.`
        );
      } else {
        this.logger.info(
          `Проверка решений не выполнялась в последние ${this.plugin.config.checkInterval} минут. Выполняем проверку...`
        );
        await this.checkExpiredDecisions();
      }
    } else {
      this.logger.info('Дата последней проверки отсутствует. Выполняем проверку...');
      await this.checkExpiredDecisions();
    }

    // Регистрация cron-задачи для проверки истекших решений
    const cronExpression = `*/${this.plugin.config.checkInterval || 5} * * * *`; // каждые N минут, значение по умолчанию 5
    cron.schedule(cronExpression, async () => {
      this.logger.info('Запуск задачи проверки истекших решений');
      try {
        await this.checkExpiredDecisions();
      } catch (error) {
        const errorObj = error as Error;
        this.logger.error(
          'Ошибка при выполнении задачи проверки истекших решений:',
          errorObj.message || 'Неизвестная ошибка'
        );
      }
    });
  }

  // Логирование действий
  private async log(action: ILog) {
    await this.logExtensionRepository.push(this.name, {
      ...action,
      timestamp: new Date().toISOString(),
    });
  }

  // Основная функция проверки и отмены истекших решений
  private async checkExpiredDecisions() {
    try {
      // Получаем coopname из конфигурации
      const coopname = config.coopname;

      this.logger.info(`Проверка решений для кооператива ${coopname}`);

      // Запись о проверке в лог
      await this.log({
        type: 'check',
        coopname,
      });

      // Получаем все решения для кооператива
      const decisions = await this.sovietBlockchainPort.getDecisions(coopname);

      // Текущая дата для сравнения
      const now = new Date();
      // Находим истекшие решения
      const expiredDecisions = decisions.filter((decision) => {
        // TODO: убрать после первого деплоя т.к. все старые решения отменятся.
        // Если поле expired_at не существует, добавляем
        if (!decision.expired_at) return true;

        // Если решение уже принято и не требуется отменять принятые решения, пропускаем
        if (decision.approved && !this.plugin.config.cancelApprovedDecisions) return false;

        // Конвертируем дату из формата блокчейна в JavaScript Date
        const expiredDate = new Date(decision.expired_at);

        // Проверяем, истек ли срок
        return expiredDate <= now;
      });

      this.logger.info(`Найдено ${expiredDecisions.length} истекших решений для кооператива ${coopname}`);

      // Отменяем каждое истекшее решение
      for (const decision of expiredDecisions) {
        try {
          this.logger.info(`Отмена истекшего решения ID: ${decision.id} для кооператива ${coopname}`);

          // Создаем объект данных для транзакции отмены
          const cancelData: SovietContract.Actions.Decisions.Cancelexprd.ICancelExpired = {
            coopname,
            decision_id: decision.id,
          };

          // Вызываем метод отмены из порта блокчейна
          const result = await this.sovietBlockchainPort.cancelExpiredDecision(cancelData);

          // Запись об успешной отмене в лог
          await this.log({
            type: 'cancel',
            coopname,
            decision_id: decision.id.toString(),
            result: 'success',
          });

          // Безопасно обращаемся к результату транзакции
          const txId = result.resolved?.transaction?.id ? result.resolved.transaction.id : 'неизвестно';
          this.logger.info(`Решение ID: ${decision.id} успешно отменено`, { transactionId: txId });
        } catch (error) {
          // Безопасно обрабатываем ошибку
          const errorObj = error as Error;
          this.logger.error(`Ошибка при отмене решения ID: ${decision.id}`, errorObj.message || 'Неизвестная ошибка');

          // Запись об ошибке в лог
          await this.log({
            type: 'cancel',
            coopname,
            decision_id: decision.id.toString(),
            result: `error: ${errorObj.message || 'Неизвестная ошибка'}`,
          });
        }
      }

      // Обновляем дату последней проверки
      this.plugin.config.lastCheckDate = new Date().toISOString();
      await this.extensionRepository.update(this.plugin);

      this.logger.info('Проверка истекших решений завершена');
    } catch (error) {
      // Безопасно обрабатываем ошибку
      const errorObj = error as Error;
      this.logger.error('Ошибка при проверке истекших решений:', errorObj.message || 'Неизвестная ошибка');
    }
  }
}

@Module({
  providers: [ChairmanPlugin],
})
export class ChairmanPluginModule {
  constructor(private readonly chairmanPlugin: ChairmanPlugin) {}

  async initialize() {
    await this.chairmanPlugin.initialize();
  }
}
