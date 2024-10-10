# Система миграций для смарт-контрактов COOPOS
Эта система автоматических миграций для смарт-контрактов COOPOS разработана на Node.js и TypeScript. Она предназначена для выполнения миграционных файлов с использованием паттерна фабрики. Система отслеживает состояние миграций и гарантирует, что будут выполнены только те миграции, которые еще не были применены. Конфигурация, специфичная для окружения, может загружаться динамически из различных файлов .env (например, local.env, prod.env).

## Возможности
- Автоматическое выполнение миграций: Выполняет миграционные скрипты в указанном порядке.
- Отслеживание состояния миграций: Сохраняет информацию о последней выполненной миграции в файле migration_state.json.
- Динамическая загрузка конфигурации для окружений: Использует файлы .env для настроек, специфичных для разных окружений.
- Паттерн фабрики: Динамически загружает и выполняет миграционные файлы.
- Поддержка нескольких окружений: Легкое переключение между различными окружениями (например, local или prod) с использованием переменных окружения.

## Требования
- Node.js (v14.x или выше)
- TypeScript (последняя версия)
- COOPOS (EOSJS библиотека для взаимодействия с блокчейном COOPOS)
- Библиотека fs-extra для операций с файловой системой


## Установка
Склонируйте репозиторий:

``` bash
git clone <repository_url>
cd <repository_directory>
```

Установите необходимые зависимости:

``` bash
npm install
Настройте .env файлы для разных окружений:
```

local.env
prod.env

Пример файла .env:

``` env
COOPOS_ENDPOINT=https://api.testnet.COOPOS.io
COOPOS_PRIVATE_KEY=your_private_key
```

``` bash
project-root/
├── migrations/                # Директория миграций
│   ├── 001_initial_migration.ts
│   ├── 002_upgrade_contract.ts
│
├── src/
│   ├── factory.ts             # Фабрика для загрузки миграций
│   ├── migrator.ts            # Основная логика миграций
│   ├── migration_interface.ts # Интерфейс для миграционных классов
│   ├── utils/dirname.ts       # Утилита для эмуляции __dirname в ES модулях
│   ├── index.ts               # Основная точка входа
│
├── migration_state.json       # Файл для отслеживания последней выполненной миграции
├── local.env                  # Конфигурация для локального окружения
├── prod.env                   # Конфигурация для продакшн окружения
├── package.json
└── tsconfig.json
```

## Использование
Создание миграционных файлов:

Миграционные файлы должны размещаться в папке migrations. Каждый файл миграции должен экспортировать класс, который реализует интерфейс Migration. Например:

``` typescript
import { Migration } from './migration_interface';

export class InitialMigration implements Migration {
  async run(): Promise<void> {
    console.log('Запуск первой миграции...');
    // Логика миграции (например, взаимодействие с контрактами COOPOS)
  }
}

```
Запуск миграций:

Для запуска миграций используйте следующую команду:

``` bash
NODE_ENV=local npx ts-node src/index.ts
```

Эта команда выполнит все ожидающие миграции, начиная с последней зафиксированной в файле migration_state.json.

Работа с разными окружениями:

Система поддерживает несколько окружений с использованием файлов .env. Чтобы указать конкретное окружение, используйте переменную NODE_ENV:

Для локального окружения:

``` bash
NODE_ENV=local npx ts-node src/index.ts

Для продакшн окружения:

``` bash
NODE_ENV=prod npx ts-node src/index.ts
```

## Детали системы миграций

### 1. Интерфейс миграций
Каждый миграционный файл должен реализовать следующий интерфейс Migration:

``` typescript
export interface Migration {
  run(): Promise<void>;
}
```

Это гарантирует, что каждый миграционный файл содержит метод run, который будет выполнен системой миграций.

### 2. Паттерн фабрики
Класс MigrationFactory динамически загружает миграционные файлы по их именам и возвращает экземпляр соответствующего класса:

``` typescript
import { Migration } from '../migrations/migration_interface';
import * as path from 'path';
import { getDirname } from '../utils/dirname';

export class MigrationFactory {
  static async createMigration(migrationFile: string): Promise<Migration | null> {
    try {
      const __dirname = getDirname(import.meta.url);
      const migrationModule = await import(path.join(__dirname, '../migrations', migrationFile + '.ts'));
      const MigrationClass = migrationModule.default || migrationModule[Object.keys(migrationModule)[0]];
      return new MigrationClass();
    } catch (error) {
      console.error(`Не удалось загрузить файл миграции ${migrationFile}:`, error);
      return null;
    }
  }
}
```

### 3. Отслеживание состояния миграций
Система миграций сохраняет информацию о последней выполненной миграции в файл migration_state.json. После успешного выполнения каждой миграции, система обновляет этот файл с указанием последней миграции.

``` json
{
  "lastMigration": "002_upgrade_contract.ts"
}
```

Если файл migration_state.json не существует, система предполагает, что миграции ещё не выполнялись, и начинает выполнение с первого файла.

### 4. Мигратор
Класс Migrator отвечает за выполнение ожидающих миграций:

``` typescript
import fs from 'fs-extra';
import * as path from 'path';
import { getDirname } from './utils/dirname';
import { MigrationFactory } from './factory';

export class Migrator {
  private stateFilePath: string;
  private state: { lastMigration: string | null };

  constructor() {
    const __dirname = getDirname(import.meta.url);
    this.stateFilePath = path.join(__dirname, '../migration_state.json');
    this.state = { lastMigration: null };
  }

  // Загрузка состояния миграций и фильтрация ожидающих миграций
  async runMigrations(): Promise<void> {
    await this.loadState();
    const pendingMigrations = await this.getPendingMigrations();

    for (const file of pendingMigrations) {
      const migration = await MigrationFactory.createMigration(file);
      if (migration) {
        await migration.run();
        this.state.lastMigration = file;
        await this.saveState();
      }
    }

    console.log('Миграции завершены.');
  }
}
```

## Решение проблем

Проблема: Миграция не загружается
Убедитесь, что файл миграции существует в директории migrations. Проверьте имя файла в migration_state.json и убедитесь, что оно совпадает с существующими файлами миграций.

Проблема: Миграция не найдена (например, "MigrationClass is not a constructor")
Убедитесь, что ваши файлы миграций экспортируют класс, который реализует интерфейс Migration.


## Лицензия
Этот проект лицензирован под лицензией MIT.

