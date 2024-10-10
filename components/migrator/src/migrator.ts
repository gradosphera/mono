import fs from 'fs-extra';  // Правильный импорт fs-extra
import * as path from 'path';
import { getDirname } from './utils/dirname';
import { MigrationFactory } from './factory';

interface MigrationState {
  lastMigration: string | null;
}

export class Migrator {
  private stateFilePath: string;
  private state: MigrationState;

  constructor() {
    const __dirname = getDirname(import.meta.url);
    this.stateFilePath = path.join(__dirname, '../migration_state.json');
    this.state = { lastMigration: null };
  }

  // Загружаем состояние из файла
  private async loadState(): Promise<void> {
    try {
      if (await fs.pathExists(this.stateFilePath)) {
        const stateData = await fs.readFile(this.stateFilePath, 'utf-8');  // Используем fs напрямую
        this.state = JSON.parse(stateData);
      } else {
        // Если файл не существует, создаем его с начальным значением
        await this.saveState();
      }
    } catch (error) {
      console.error('Failed to load migration state:', error);
    }
  }

  // Сохраняем состояние в файл
  private async saveState(): Promise<void> {
    try {
      await fs.writeFile(this.stateFilePath, JSON.stringify(this.state, null, 2));  // Используем fs напрямую
    } catch (error) {
      console.error('Failed to save migration state:', error);
    }
  }

  // Получаем список миграций, начиная с последней выполненной, и исключаем ненужные файлы
  private async getPendingMigrations(): Promise<string[]> {
    const __dirname = getDirname(import.meta.url);
    const migrationsDir = path.join(__dirname, '../migrations');
    const allMigrationFiles = await fs.readdir(migrationsDir);  // Используем fs напрямую

    // Фильтруем файлы, чтобы использовать только те, что соответствуют шаблону миграций (например, '001_some_migration.ts')
    const migrationFiles = allMigrationFiles.filter(file => file.match(/^\d+.*\.ts$/));

    if (this.state.lastMigration) {
      const lastMigrationIndex = migrationFiles.indexOf(this.state.lastMigration);
      return lastMigrationIndex >= 0
        ? migrationFiles.slice(lastMigrationIndex + 1)  // Возвращаем миграции после последней выполненной
        : migrationFiles;  // Если последняя миграция не найдена (возможно, была удалена), выполняем все
    }

    return migrationFiles;  // Если миграции еще не запускались, выполняем все
  }

  // Основной метод для выполнения миграций
  public async runMigrations(): Promise<void> {
    await this.loadState();

    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('All migrations are up to date.');
      return;
    }

    for (const file of pendingMigrations) {
      const migration = await MigrationFactory.createMigration(file);

      if (migration) {
        console.log(`Running migration: ${file}`);
        await migration.run();

        // Обновляем состояние и сохраняем его
        this.state.lastMigration = file;
        await this.saveState();
      }
    }

    console.log('Migrations completed.');
  }
}
