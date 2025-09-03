import path from 'path';
import fs from 'fs';
import { DataSource, Repository } from 'typeorm';
import { MigrationEntity } from '../infrastructure/database/typeorm/entities/migration.entity';
import config from '../config/config';
import logger from '../config/logger';
import { BlockchainService } from '../infrastructure/blockchain/blockchain.service';
import { WinstonLoggerService } from '../application/logger/logger-app.service';
import { MigrationLogger } from './migration-logger';

export interface Migration {
  name: string;
  validUntil?: Date; // Дата в UTC, до которой миграция должна применяться. Если не указана или null, миграция применяется всегда
  up: (services: { blockchain: BlockchainService; logger: MigrationLogger }) => Promise<boolean>;
}

export class MigrationManager {
  private dataSource!: DataSource;
  private migrationRepository!: Repository<MigrationEntity>;
  private migrationDir!: string;
  private blockchainService: BlockchainService;

  constructor() {
    this.migrationDir = path.join(process.cwd(), '/migrations');

    // Создаем экземпляр логгера для блокчейн-сервиса
    const loggerService = new WinstonLoggerService();
    this.blockchainService = new BlockchainService(loggerService);
  }

  async initialize(): Promise<void> {
    // Инициализируем подключение к PostgreSQL
    this.dataSource = new DataSource({
      type: 'postgres',
      host: config.postgres.host,
      port: Number(config.postgres.port),
      username: config.postgres.username,
      password: config.postgres.password,
      database: config.postgres.database,
      entities: [MigrationEntity],
      synchronize: true,
    });

    await this.dataSource.initialize();
    this.migrationRepository = this.dataSource.getRepository(MigrationEntity);
    logger.info('Миграционный менеджер инициализирован');
  }

  async close(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  // Извлекает версию из имени файла (например, из V1.0.0__initial.ts получаем 1.0.0)
  extractVersionFromFilename(filename: string): string {
    const versionMatch = filename.match(/^V(\d+(\.\d+)*)/);
    if (!versionMatch) {
      throw new Error(`Неверный формат имени файла миграции: ${filename}. Ожидается формат V{версия}__{название}.ts`);
    }
    return versionMatch[1];
  }

  // Извлекает описательное название из имени файла (например, из V1.0.0__initial.ts получаем initial)
  extractDescriptionFromFilename(filename: string): string {
    const descMatch = filename.match(/^V\d+(\.\d+)*__(.+?)(\.[tj]s)?$/);
    if (descMatch && descMatch[2]) {
      return descMatch[2].replace(/_/g, ' ');
    }
    return filename; // Вернуть полное имя файла, если не удалось извлечь описание
  }

  async getMigrationFiles(): Promise<{ filename: string; version: string; description: string }[]> {
    try {
      const files = fs
        .readdirSync(this.migrationDir)
        .filter((file) => (file.endsWith('.ts') || file.endsWith('.js')) && file.startsWith('V'));

      // Извлекаем версии и описания из имен файлов
      const migrations = files.map((filename) => ({
        filename,
        version: this.extractVersionFromFilename(filename),
        description: this.extractDescriptionFromFilename(filename),
      }));

      // Сортируем по версии (используем semver сортировку)
      migrations.sort((a, b) => {
        const aParts = a.version.split('.').map(Number);
        const bParts = b.version.split('.').map(Number);

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = i < aParts.length ? aParts[i] : 0;
          const bVal = i < bParts.length ? bParts[i] : 0;

          if (aVal !== bVal) {
            return aVal - bVal;
          }
        }

        return 0;
      });

      return migrations;
    } catch (error) {
      logger.error('Ошибка при чтении директории миграций:', error);
      return [];
    }
  }

  async loadMigration(filename: string): Promise<{ migration: Migration; version: string; description: string } | null> {
    try {
      const filePath = path.join(this.migrationDir, filename);
      // Импортируем файл миграции динамически
      const migration = await import(filePath);
      const version = this.extractVersionFromFilename(filename);
      const description = this.extractDescriptionFromFilename(filename);

      return {
        migration: migration.default,
        version,
        description,
      };
    } catch (error) {
      logger.error(`Ошибка при загрузке миграции ${filename}:`, error);
      return null;
    }
  }

  async getAppliedMigrations(): Promise<MigrationEntity[]> {
    return this.migrationRepository.find({ order: { version: 'ASC' } });
  }

  async markMigrationAsApplied(version: string, name: string, success: boolean, isTest: boolean): Promise<void> {
    if (isTest) {
      logger.info(
        `[ТЕСТОВАЯ МИГРАЦИЯ] Миграция ${version} отмечена как ${success ? 'успешная' : 'неуспешная'} (но не сохранена в БД)`
      );
      return; // Не сохраняем информацию в БД для тестовых миграций
    }

    await this.migrationRepository.save({
      version,
      name,
      executedAt: new Date(),
      success,
    });
  }

  async runMigration(migration: Migration, version: string, description: string, isTest: boolean): Promise<boolean> {
    // Создаем запись в базе данных для сохранения логов
    if (!isTest) {
      await this.migrationRepository.save({
        version,
        name: migration.name,
        executedAt: new Date(),
        success: false, // Изначально помечаем как неуспешную
        logs: '', // Пустые логи изначально
      });
    }

    // Создаем логгер для миграции
    const migrationLogger = new MigrationLogger(version, this.migrationRepository);

    try {
      if (isTest) {
        migrationLogger.info(`[ТЕСТОВАЯ МИГРАЦИЯ] Запуск миграции ${version} (${description}): ${migration.name}`);
      } else {
        migrationLogger.info(`Запуск миграции ${version} (${description}): ${migration.name}`);
      }

      // Предоставляем блокчейн-сервис и логгер в миграцию
      const result = await migration.up({ blockchain: this.blockchainService, logger: migrationLogger });

      // Обновляем статус миграции в базе данных
      if (!isTest) {
        await this.migrationRepository.update({ version }, { success: result });
      }

      if (isTest) {
        migrationLogger.info(
          `[ТЕСТОВАЯ МИГРАЦИЯ] Миграция ${version} (${description}) выполнена ${result ? 'успешно' : 'с ошибками'}`
        );
      } else {
        migrationLogger.info(`Миграция ${version} (${description}) выполнена ${result ? 'успешно' : 'с ошибками'}`);
      }

      // Сохраняем логи в базе данных
      await migrationLogger.saveLogs();

      return result;
    } catch (error) {
      migrationLogger.error(`Ошибка при выполнении миграции ${version} (${description}): ${error}`);

      // Обновляем статус миграции в базе данных
      if (!isTest) {
        await this.migrationRepository.update({ version }, { success: false });
      }

      // Сохраняем логи даже в случае ошибки
      await migrationLogger.saveLogs();

      return false;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      logger.info('Запуск миграций данных...');

      // Получаем все файлы миграций с их версиями и описаниями
      const migrationFiles = await this.getMigrationFiles();
      logger.info(`Найдено ${migrationFiles.length} файлов миграций`);

      // Вывод списка найденных миграций
      if (migrationFiles.length > 0) {
        logger.info('Список найденных миграций:');
        migrationFiles.forEach(({ version, description, filename }) => {
          logger.info(`- ${version}: ${description} (${filename})`);
        });
      }

      // Получаем уже примененные миграции
      const appliedMigrations = await this.getAppliedMigrations();
      logger.info(`В базе данных найдено ${appliedMigrations.length} примененных миграций`);

      const appliedVersions = new Set(appliedMigrations.map((m) => m.version));
      const currentDate = new Date();

      for (const { filename, version, description } of migrationFiles) {
        const isTest = filename.includes('__test');

        // Обычные миграции пропускаем, если уже применялись
        if (!isTest && appliedVersions.has(version)) {
          logger.info(`Миграция ${version} (${description}) уже применена, пропускаем`);
          continue;
        }

        // Грузим файл миграции
        const result = await this.loadMigration(filename);
        if (!result) {
          logger.warn(`Не удалось загрузить миграцию из файла ${filename}`);
          continue;
        }

        const { migration } = result;

        // Проверяем дату валидности миграции
        if (migration.validUntil && currentDate > migration.validUntil) {
          logger.info(
            `Миграция ${version} (${description}) не будет применена, так как дата валидности истекла (${migration.validUntil.toISOString()})`
          );
          continue;
        }

        // Если это тестовая миграция, сообщаем об этом
        if (isTest) {
          logger.info(`Миграция ${version} (${description}) запускается в ТЕСТОВОМ режиме (по имени файла)`);
        }

        // Запускаем миграцию
        const success = await this.runMigration(migration, version, description, isTest);

        // Останавливаем процесс только при ошибке в НЕ тестовых миграциях
        if (!success && !isTest) {
          logger.error(`Миграция ${version} (${description}) завершена с ошибкой, останавливаем процесс`);
          break;
        }
      }

      logger.info('Процесс миграций завершен');
    } catch (error) {
      logger.error('Ошибка в процессе миграции:', error);
      throw error;
    }
  }
}
