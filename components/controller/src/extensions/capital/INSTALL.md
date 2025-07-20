# Установка расширения Capital

## Требования

- PostgreSQL 12+
- Node.js 18+
- Отдельная база данных или схема для capital

## Настройка базы данных

1. Создайте отдельную базу данных для capital:
```sql
CREATE DATABASE capital;
```

2. Или создайте отдельную схему в существующей базе:
```sql
CREATE SCHEMA capital;
```

## Переменные окружения

Добавьте в файл `.env`:

```env
# Настройки базы данных для capital
POSTGRES_DB_CAPITAL=capital
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

## Автоматическая синхронизация

В development режиме схема базы данных создается автоматически при запуске приложения.

## Производственная среда

Для production используйте миграции TypeORM:

1. Сгенерируйте миграции:
```bash
npm run typeorm:generate-migration -- capital-initial
```

2. Запустите миграции:
```bash
npm run typeorm:run-migrations
```

## Проверка установки

После запуска приложения расширение capital должно быть доступно в GraphQL схеме:

```graphql
query {
  getProjects {
    id
    title
    status
  }
}
```
