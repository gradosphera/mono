import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { z } from 'zod';
import type { DeserializedDescriptionOfExtension } from '~/types/shared';
import { merge } from 'lodash';
import { ConfigModule } from '@nestjs/config';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { DocumentInfrastructureModule } from '~/infrastructure/document/document-infrastructure.module';
import config from '~/config/config';

// Application
import { OneCoopApplicationService } from './application/services/oneccoop.service';
import { OneCoopResolver } from './application/resolvers/oneccoop.resolver';

// Domain
import { DocumentAdapterFactoryService } from './domain/services/document-adapter-factory.service';
import { JoinCoopDocumentAdapter } from './domain/adapters/joincoop-document.adapter';

// Infrastructure
import { OneCoopBlockchainService } from './infrastructure/services/oneccoop-blockchain.service';

// Guard
import { OneCoopSecretKeyGuard } from './application/guards/oneccoop-secret-key.guard';

// Функция для описания полей в схеме конфигурации
function describeField(description: DeserializedDescriptionOfExtension): string {
  return JSON.stringify(description);
}

// Функция для извлечения hostname из URL
function extractHostname(url: string): string {
  try {
    // Используем URL конструктор для правильного парсинга
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // Если URL невалидный, используем regex для извлечения hostname
    // eslint-disable-next-line no-useless-escape
    const match = url.match(/^https?:\/\/([^\/:]+)/);
    return match ? match[1] : url;
  }
}

// Извлекаем hostname из конфигурации
const hostname = extractHostname(config.base_url);

// Дефолтные параметры конфигурации
export const defaultConfig = {
  secret_key: '',
  base_url: hostname,
};

// Zod-схема для конфигурации
export const Schema = z.object({
  secret_key: z
    .string()
    .min(10, 'Секретный ключ обязателен')
    .describe(
      describeField({
        label: 'Секретный ключ API',
        note: 'Генерируется автоматически при установке расширения. Используется для аутентификации запросов из 1С.',
        visible: true,
        readonly: true,
        password: true,
        generator: 'randomSecret',
      })
    ),
  base_url: z
    .string()
    .min(1, 'Домен обязателен')
    .regex(/^[a-zA-Z0-9.-]+$/, 'Домен должен содержать только буквы, цифры, точки и дефисы')
    .default(hostname)
    .describe(
      describeField({
        label: 'Домен сайта',
        note: 'Домен вашего сайта кооператива (например: domovoy.ru или localhost). Используется для настройки расширения 1С.',
        visible: true,
        readonly: true,
        default: hostname,
        copyable: true,
      })
    ),
});

// Тип конфигурации
export type IConfig = z.infer<typeof Schema>;

/**
 * Плагин расширения 1CCoop
 * Предоставляет API для интеграции с внешней бухгалтерией 1С
 */
export class OneCoopPlugin extends BaseExtModule implements OnModuleDestroy {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(OneCoopPlugin.name);
  }

  name = 'onecoop';
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

    // Проверяем наличие secret_key (должен быть сгенерирован на фронтенде при установке)
    if (!this.plugin.config.secret_key) {
      throw new Error('secret_key обязателен для расширения 1CCoop. Переустановите расширение.');
    }

    this.logger.info(`Инициализация ${this.name} завершена`, {
      hasSecretKey: !!this.plugin.config.secret_key,
    });
  }

  onModuleDestroy() {
    this.logger.info(`Расширение ${this.name} остановлено`);
  }

  /**
   * Получает текущий секретный ключ
   */
  getSecretKey(): string {
    return this.plugin?.config?.secret_key || '';
  }
}

/**
 * Модуль расширения 1CCoop
 * Предоставляет GraphQL API для интеграции с внешней бухгалтерией
 */
@Module({
  imports: [ConfigModule, AccountInfrastructureModule, DocumentInfrastructureModule],
  providers: [
    // Plugin
    OneCoopPlugin,

    // Application Services
    OneCoopApplicationService,

    // Domain Services
    DocumentAdapterFactoryService,

    // Document Adapters
    JoinCoopDocumentAdapter,

    // Infrastructure Services
    OneCoopBlockchainService,

    // Guards
    OneCoopSecretKeyGuard,

    // GraphQL Resolvers
    OneCoopResolver,
  ],
  exports: [OneCoopPlugin, OneCoopSecretKeyGuard],
})
export class OneCoopPluginModule {
  constructor(private readonly oneCoopPlugin: OneCoopPlugin) {}

  async initialize() {
    await this.oneCoopPlugin.initialize();
  }
}
