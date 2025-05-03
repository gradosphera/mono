import { Inject, Module } from '@nestjs/common';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { z } from 'zod';
import { BaseExtModule } from '../base.extension.module';

// Дефолтные параметры конфигурации
export const defaultConfig = {};

export const Schema = z.object({});

// Интерфейс для параметров конфигурации плагина
export type IConfig = z.infer<typeof Schema>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILog {}

export class BuiltinPlugin extends BaseExtModule {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(BuiltinPlugin.name);
  }

  name = 'builtin';
  plugin!: ExtensionDomainEntity<IConfig>;

  async initialize(): Promise<void> {
    //nothing
  }

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;
}

@Module({
  providers: [BuiltinPlugin], // Регистрируем SberpollPlugin как провайдер
  exports: [BuiltinPlugin], // Экспортируем его для доступа в других модулях
})
export class BuiltinPluginModule {
  constructor(private readonly builtinPlugin: BuiltinPlugin) {}

  async initialize() {
    await this.builtinPlugin.initialize();
  }
}
