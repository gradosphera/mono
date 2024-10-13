import fs from 'fs-extra';  // Правильный импорт fs-extra
import * as path from 'path';
import { getDirname } from './utils/dirname';
import { MigrationFactory } from './factory';

interface MigrationState {
  [env: string]: string | null;
}

export class Migrator {
  private stateFilePath: string;
  private state: MigrationState;
  private env: string;

  constructor() {
    const __dirname = getDirname(import.meta.url);
    this.stateFilePath = path.join(__dirname, '../migration_state.json');
    this.env = process.env.NODE_ENV || 'local';  // Получаем текущее окружение
    this.state = { [this.env]: null };  // Инициализируем состояние для текущего окружения
  }

  // Загружаем состояние из файла
  private async loadState(): Promise<void> {
    try {
      if (await fs.pathExists(this.stateFilePath)) {
        const stateData = await fs.readFile(this.stateFilePath, 'utf-8');
        this.state = JSON.parse(stateData);
      } else {
        // Если файл не существует, создаем его с начальными значениями для всех окружений
        await this.saveState();
      }

      // Если состояние для текущего окружения отсутствует, инициализируем его
      if (!this.state[this.env]) {
        this.state[this.env] = null;
        await this.saveState();
      }
    } catch (error) {
      console.error('Failed to load migration state:', error);
    }
  }

  // Сохраняем состояние в файл
  private async saveState(): Promise<void> {
    try {
      await fs.writeFile(this.stateFilePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save migration state:', error);
    }
  }

  // Получаем список миграций, начиная с последней выполненной для текущего окружения
  private async getPendingMigrations(): Promise<string[]> {
    const __dirname = getDirname(import.meta.url);
    const migrationsDir = path.join(__dirname, '../migrations');
    const allMigrationFiles = await fs.readdir(migrationsDir);

    const migrationFiles = allMigrationFiles.filter(file => file.match(/^\d+.*\.ts$/));

    if (this.state[this.env]) {
      const lastMigrationIndex = migrationFiles.indexOf(this.state[this.env] as string);
      return lastMigrationIndex >= 0
        ? migrationFiles.slice(lastMigrationIndex + 1)
        : migrationFiles;  // Если последняя миграция не найдена, выполняем все миграции
    }

    return migrationFiles;  // Если миграции еще не запускались для текущего окружения, выполняем все
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

        // Обновляем состояние для текущего окружения и сохраняем его
        this.state[this.env] = file;
        await this.saveState();
      }
    }

    console.log('Migrations completed.');
  }
}
