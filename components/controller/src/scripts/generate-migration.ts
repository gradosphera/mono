import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

// Получаем аргументы командной строки
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Использование: npm run migration:generate <migration_name>');
  console.error('Пример: npm run migration:generate create_user_table');
  process.exit(1);
}

const migrationName = args[0];

// Получаем список существующих миграций
const migrationsDir = path.join(__dirname, '../../migrations');
const files = fs.readdirSync(migrationsDir).filter((f) => f.startsWith('V') && f.endsWith('.ts'));

// Находим последнюю версию
let lastVersion = '1.0.0';
if (files.length > 0) {
  const versions = files.map((f) => {
    const match = f.match(/^V(\d+(?:\.\d+)*)/);
    return match ? match[1] : '1.0.0';
  });

  // Сортируем версии
  versions.sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = i < aParts.length ? aParts[i] : 0;
      const bVal = i < bParts.length ? bParts[i] : 0;

      if (aVal !== bVal) {
        return aVal - bVal;
      }
    }

    return 0;
  });

  lastVersion = versions[versions.length - 1];
}

// Увеличиваем версию (последний номер)
const versionParts = lastVersion.split('.').map(Number);
versionParts[versionParts.length - 1] += 1;
const newVersion = versionParts.join('.');

// Создаем имя файла
const fileName = `V${newVersion}__${migrationName}.ts`;
const filePath = path.join(migrationsDir, fileName);

// Шаблон миграции
const template = `import { DataSource } from 'typeorm';
import config from '../src/config/config';

export default {
  name: '${migrationName.replace(/_/g, ' ')}',
  validUntil: new Date('2025-12-31'), // Действует до конца года

  async up({ dataSource }: { dataSource: any }): Promise<boolean> {
    console.log('Выполнение миграции: ${migrationName.replace(/_/g, ' ')}');

    try {
      console.log('Используем существующее подключение к PostgreSQL');

      // TODO: Добавить SQL команды для миграции

      console.log('Миграция завершена: ${migrationName.replace(/_/g, ' ')} успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при выполнении миграции:', error);
      return false;
    }
  },

  async down({ dataSource }: { dataSource: any }): Promise<boolean> {
    console.log('Откат миграции: ${migrationName.replace(/_/g, ' ')}');

    try {
      console.log('Используем существующее подключение к PostgreSQL для отката');

      // TODO: Добавить SQL команды для отката

      console.log('Откат миграции завершен: ${migrationName.replace(/_/g, ' ')} успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при откате миграции:', error);
      return false;
    }
  },
};
`;

// Создаем файл
fs.writeFileSync(filePath, template);

console.log(`✅ Миграция создана: ${fileName}`);
console.log(`📁 Путь: ${filePath}`);
console.log('\n📝 Не забудьте:');
console.log('1. Заполнить методы up() и down() SQL командами (используйте dataSource из параметров)');
console.log('2. Протестировать миграцию: npm run migration:run');
console.log('3. Проверить откат: npm run migration:rollback');
