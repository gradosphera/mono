// domain/extension/services/extension-schema-migration.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { EXTENSION_REPOSITORY, ExtensionDomainRepository } from '../repositories/extension-domain.repository';
import { ExtensionDomainEntity } from '../entities/extension-domain.entity';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

/**
 * Интерфейс для миграции схемы расширения
 */
export interface IExtensionSchemaMigration<TOldConfig = any, TNewConfig = any> {
  /**
   * Уникальное имя расширения
   */
  extensionName: string;

  /**
   * Версия миграции (для отслеживания порядка применения)
   */
  version: number;

  /**
   * Функция миграции: преобразует старую конфигурацию в новую
   * @param oldConfig Старая конфигурация из базы данных
   * @param defaultConfig Дефолтная конфигурация новой схемы
   * @returns Новая конфигурация, совместимая с новой схемой
   */
  migrate(oldConfig: TOldConfig, defaultConfig: TNewConfig): TNewConfig;
}

/**
 * Сервис для миграции схем расширений
 * Применяет миграции к конфигурациям расширений при их загрузке
 */
@Injectable()
export class ExtensionSchemaMigrationService {
  private migrations: Map<string, IExtensionSchemaMigration[]> = new Map();

  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<any>,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ExtensionSchemaMigrationService.name);
  }

  /**
   * Регистрирует миграцию для расширения
   */
  registerMigration(migration: IExtensionSchemaMigration): void {
    const existing = this.migrations.get(migration.extensionName) || [];
    existing.push(migration);
    existing.sort((a, b) => a.version - b.version);
    this.migrations.set(migration.extensionName, existing);
  }

  /**
   * Применяет все необходимые миграции к конфигурации расширения
   * @param extensionName Имя расширения
   * @param currentConfig Текущая конфигурация из БД
   * @param defaultConfig Дефолтная конфигурация новой схемы
   * @param currentVersion Текущая версия схемы
   * @returns Мигрированная конфигурация и новая версия
   */
  async migrateExtensionConfig<TConfig = any>(
    extensionName: string,
    currentConfig: any,
    defaultConfig: TConfig,
    currentVersion = 1
  ): Promise<{ config: TConfig; version: number }> {
    const migrations = this.migrations.get(extensionName) || [];

    this.logger.info(
      `[MIGRATE_CONFIG] Проверка миграций для расширения ${extensionName}. Текущая версия: ${currentVersion}. Найдено миграций: ${migrations.length}`
    );

    if (migrations.length === 0) {
      this.logger.info(`[MIGRATE_CONFIG] Миграции для ${extensionName} не найдены`);
      return { config: { ...defaultConfig, ...currentConfig } as TConfig, version: currentVersion };
    }

    this.logger.info(
      `[MIGRATE_CONFIG] Доступные миграции для ${extensionName}: ${migrations.map((m) => `v${m.version}`).join(', ')}`
    );

    let migratedConfig = { ...currentConfig };
    let latestVersion = currentVersion;

    // Применяем миграции по порядку, начиная с версии выше текущей
    for (const migration of migrations) {
      this.logger.info(
        `[MIGRATE_CONFIG] Проверка миграции v${migration.version} для ${extensionName} (нужна: ${
          migration.version > currentVersion
        })`
      );
      if (migration.version > currentVersion) {
        this.logger.info(
          `[MIGRATE_CONFIG] Применение миграции v${migration.version} для расширения ${extensionName} (текущая версия: ${currentVersion})`
        );
        this.logger.info(`[MIGRATE_CONFIG] Конфигурация перед миграцией: ${JSON.stringify(migratedConfig)}`);
        migratedConfig = migration.migrate(migratedConfig, defaultConfig);
        latestVersion = migration.version;
        this.logger.info(
          `[MIGRATE_CONFIG] Конфигурация после миграции v${migration.version}: ${JSON.stringify(migratedConfig)}`
        );
      } else {
        this.logger.info(`[MIGRATE_CONFIG] Миграция v${migration.version} пропущена (текущая версия: ${currentVersion})`);
      }
    }

    const finalConfig = { ...defaultConfig, ...migratedConfig } as TConfig;
    this.logger.info(`[MIGRATE_CONFIG] Финальная версия для ${extensionName}: ${latestVersion}`);
    this.logger.info(`[MIGRATE_CONFIG] Финальная конфигурация: ${JSON.stringify(finalConfig)}`);

    return { config: finalConfig, version: latestVersion };
  }

  /**
   * Применяет миграции и обновляет конфигурацию расширения в БД
   */
  async migrateAndUpdateExtension<TConfig = any>(
    extensionName: string,
    defaultConfig: TConfig
  ): Promise<ExtensionDomainEntity<TConfig> | null> {
    this.logger.info(`[MIGRATION] Начало миграции расширения ${extensionName}`);

    const extension = await this.extensionRepository.findByName(extensionName);
    if (!extension) {
      this.logger.info(`[MIGRATION] Расширение ${extensionName} не найдено в базе данных`);
      return null;
    }

    const currentVersion = (extension as any).schema_version ?? 1;
    this.logger.info(`[MIGRATION] Найдено расширение ${extensionName}. Текущая версия: ${currentVersion}`);
    this.logger.info(`[MIGRATION] Текущая конфигурация: ${JSON.stringify(extension.config)}`);

    const { config: migratedConfig, version: newVersion } = await this.migrateExtensionConfig(
      extensionName,
      extension.config,
      defaultConfig,
      currentVersion
    );

    // Проверяем, изменилась ли конфигурация или версия
    const configChanged = JSON.stringify(extension.config) !== JSON.stringify(migratedConfig);
    const versionChanged = currentVersion !== newVersion;

    this.logger.info(
      `[MIGRATION] Результаты проверки для ${extensionName}: configChanged=${configChanged}, versionChanged=${versionChanged} (новая версия: ${newVersion})`
    );

    if (configChanged || versionChanged) {
      this.logger.info(`[MIGRATION] Применяем обновление для ${extensionName}`);

      const updatedExtension = await this.extensionRepository.update({
        name: extensionName,
        config: migratedConfig,
        schema_version: newVersion,
      });

      this.logger.info(
        `[MIGRATION] Миграция расширения ${extensionName} завершена успешно. Финальная версия: ${newVersion}`
      );
      this.logger.info(`[MIGRATION] Финальная конфигурация: ${JSON.stringify(migratedConfig)}`);
      return updatedExtension;
    }

    this.logger.info(`[MIGRATION] Расширение ${extensionName} не требует миграции (версия ${currentVersion})`);
    return extension as ExtensionDomainEntity<TConfig>;
  }
}
