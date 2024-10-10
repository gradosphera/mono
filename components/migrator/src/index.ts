import { config } from 'dotenv';
import { Migrator } from './migrator';
import * as path from 'path';
import { getDirname } from './utils/dirname';

// Эмуляция __dirname для ESM
const __dirname = getDirname(import.meta.url);

// Получаем имя окружения (например, "local" или "prod") из аргументов командной строки или переменной среды
const env = process.env.NODE_ENV || 'local';

// Загружаем соответствующий файл .env
const envFilePath = path.join(__dirname, `../${env}.env`);
config({ path: envFilePath });

(async () => {
  const migrator = new Migrator();
  await migrator.runMigrations();
})();
