import { Migration } from './migration_interface';
import * as path from 'path';
import { getDirname } from './utils/dirname';

export class MigrationFactory {
  static async createMigration(migrationFile: string): Promise<Migration | null> {
    try {
      // Эмулируем __dirname с помощью функции getDirname
      const __dirname = getDirname(import.meta.url);
      const migrationModule = await import(path.join(__dirname, '../migrations', migrationFile));
      const MigrationClass = migrationModule.default || migrationModule[Object.keys(migrationModule)[0]];
      return new MigrationClass();
    } catch (error) {
      console.error(`Failed to load migration file ${migrationFile}:`, error);
      return null;
    }
  }
}
