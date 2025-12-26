/* eslint-disable no-case-declarations */
import 'reflect-metadata';
import mongoose from 'mongoose';
import { MigrationManager } from '../migrator/migrationManager';
import config from '../config/config';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    showHelp();
    return;
  }

  try {
    // Подключение к MongoDB для миграций
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to MongoDB for migrations');
    const migrationManager = new MigrationManager();
    await migrationManager.initialize();

    switch (command) {
      case 'run':
        console.log('🚀 Запуск всех миграций...');
        await migrationManager.runMigrations();
        break;

      case 'run-specific':
        const version = args[1];
        if (!version) {
          console.error('❌ Укажите версию миграции: npm run migration:run-specific V1.0.1');
          process.exit(1);
        }
        console.log(`🚀 Запуск миграции ${version}...`);
        const runResult = await migrationManager.runSpecificMigration(version);
        if (runResult) {
          console.log(`✅ Миграция ${version} выполнена успешно`);
        } else {
          console.log(`❌ Ошибка выполнения миграции ${version}`);
          process.exit(1);
        }
        break;

      case 'rollback':
        const rollbackVersion = args[1];
        if (!rollbackVersion) {
          console.error('❌ Укажите версию миграции для отката: npm run migration:rollback V1.0.1');
          process.exit(1);
        }
        console.log(`🔄 Откат миграции ${rollbackVersion}...`);
        const rollbackResult = await migrationManager.rollbackMigration(rollbackVersion);
        if (rollbackResult) {
          console.log(`✅ Миграция ${rollbackVersion} откачена успешно`);
        } else {
          console.log(`❌ Ошибка отката миграции ${rollbackVersion}`);
          process.exit(1);
        }
        break;

      case 'rollback-latest':
        console.log('🔄 Откат последней успешно выполненной миграции...');
        const rollbackLatestResult = await migrationManager.rollbackLatestMigration();
        if (rollbackLatestResult) {
          console.log('✅ Последняя миграция откачена успешно');
        } else {
          console.log('❌ Ошибка отката последней миграции');
          process.exit(1);
        }
        break;

      case 'status':
        console.log('📊 Статус миграций...');
        const appliedMigrations = await migrationManager.getAppliedMigrations();
        console.log(`📋 Всего применено миграций: ${appliedMigrations.length}`);
        appliedMigrations.forEach((m) => {
          const status = m.success ? '✅' : '❌';
          console.log(`${status} ${m.version} - ${m.name} (${m.executedAt.toISOString()})`);
        });
        break;

      case 'list':
        console.log('📝 Доступные миграции...');
        const migrationFiles = await migrationManager.getMigrationFiles();
        migrationFiles.forEach((m) => {
          console.log(`📄 ${m.version} - ${m.description} (${m.filename})`);
        });
        break;

      default:
        console.error(`❌ Неизвестная команда: ${command}`);
        await mongoose.disconnect().catch((err) => console.error('Ошибка при закрытии соединения с MongoDB:', err));
        showHelp();
        process.exit(1);
    }

    await migrationManager.close();
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка выполнения команды:', error);
    await mongoose.disconnect().catch((err) => console.error('Ошибка при закрытии соединения с MongoDB:', err));
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🛠️  Migration CLI - Управление миграциями базы данных

📚 Доступные команды:

  🚀 Запуск миграций:
    npm run migration:run                    # Запуск всех миграций
    npm run migration:run-specific V1.0.1   # Запуск конкретной миграции

  🔄 Откат миграций:
    npm run migration:rollback V1.0.1       # Откат конкретной миграции
    npm run migration:rollback-latest       # Откат последней успешно выполненной миграции

  📊 Информация:
    npm run migration:status                 # Статус выполненных миграций
    npm run migration:list                   # Список доступных миграций

  🆕 Создание миграций:
    npm run migration:generate create_table  # Создать новую миграцию

📝 Примеры использования:

  # Создать новую миграцию
  npm run migration:generate add_user_email

  # Запустить все миграции
  npm run migration:run

  # Посмотреть статус
  npm run migration:status

  # Откатить последнюю миграцию
  npm run migration:rollback V1.0.9

  # Откатить последнюю успешно выполненную миграцию
  npm run migration:rollback-latest

⚠️  Важно:
  - Всегда тестируйте миграции перед запуском в production
  - Откат может привести к потере данных
  - Делайте бэкапы перед откатом
`);
}

main().catch(async (error) => {
  console.error('💥 Критическая ошибка:', error);
  await mongoose.disconnect().catch((err) => console.error('Ошибка при закрытии соединения с MongoDB:', err));
  process.exit(1);
});
