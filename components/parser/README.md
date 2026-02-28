# 🔍 @coopenomics/parser

Индексатор блокчейна EOSIO. Подключается к State History Plugin (SHiP) через WebSocket, в реальном времени парсит действия и дельты таблиц из блоков, сохраняет данные в MongoDB и публикует события в Redis Streams для дальнейшей обработки другими сервисами.

## Основные возможности

- Подключение к EOSIO State History Plugin по WebSocket
- Парсинг действий (actions) и дельт таблиц (table deltas) из блоков
- Сохранение индексированных данных в MongoDB
- Публикация событий в Redis Streams
- REST API для запросов с пагинацией и фильтрацией
- Обработка форков блокчейна
- Расширение кастомными обработчиками действий и дельт
- Конфигурируемые подписки на конкретные таблицы и контракты

## Установка

Компонент является частью монорепозитория. Установка зависимостей из корня проекта:

```bash
pnpm install
```

Или только для этого компонента:

```bash
pnpm install --filter @coopenomics/parser
```

## Скрипты

| Скрипт | Команда | Описание |
|--------|---------|----------|
| `dev` | `pnpm run dev` | Запуск в режиме разработки (nodemon) |
| `dev:test` | `pnpm run dev:test` | Режим разработки с NODE_ENV=test |
| `start` | `pnpm run start` | Запуск production (esno) |
| `build` | `pnpm run build` | Сборка библиотеки (unbuild) |
| `test` | `pnpm run test` | Запуск тестов (Vitest) |
| `lint` | `pnpm run lint` | Проверка кода (ESLint) |
| `typecheck` | `pnpm run typecheck` | Проверка типов TypeScript |
| `doc` | `pnpm run doc` | Генерация документации (TypeDoc) |

Из корня монорепозитория:

```bash
pnpm run dev:backend   # Запуск parser + controller в режиме разработки
```

## Конфигурация

Скопируйте `.env-example` в `.env` и настройте переменные окружения:

- `API` — URL блокчейн-ноды
- `SHIP` — WebSocket URL State History Plugin
- `MONGO_EXPLORER_URI` — строка подключения к MongoDB
- `REDIS_HOST` / `REDIS_PORT` — подключение к Redis
- `START_BLOCK` — номер блока для начала индексации
- `PORT` — порт REST API
- `ACTIVATE_PARSER` — флаг активации парсера (`0` / `1`)

Подробное описание переменных — в файле `.env-example`.

## Тестирование

```bash
pnpm --filter @coopenomics/parser run test
```

## REST API

| Endpoint | Описание |
|----------|----------|
| `GET /get-tables` | Дельты таблиц (с пагинацией и фильтрацией) |
| `GET /get-actions` | Действия блокчейна (с пагинацией и фильтрацией) |
| `GET /get-current-block` | Текущий номер обработанного блока |

## Архитектура

```
src/
├── index.ts               # Точка входа
├── config.ts              # Подписки на таблицы и действия
├── ActionParser/          # Парсер действий блокчейна
│   ├── Parser/            # Ядро парсера действий
│   ├── Actions/           # Кастомные обработчики действий
│   └── Factory/           # Фабрика создания обработчиков
├── DeltaParser/           # Парсер дельт таблиц
│   ├── Parser/            # Ядро парсера дельт
│   ├── Deltas/            # Кастомные обработчики дельт
│   └── Factory/           # Фабрика создания обработчиков
├── BlockParser/           # Парсер блоков
│   └── Parser/            # Обработка блоков целиком
├── ForkParser/            # Обработка форков блокчейна
│   ├── Parser/            # Ядро обработки форков
│   ├── Forks/             # Кастомные обработчики форков
│   └── Factory/           # Фабрика создания обработчиков
├── Database/              # Подключение к MongoDB
├── Initializer/           # Инициализация и настройка
├── Reader/                # Чтение данных из SHiP (WebSocket)
├── RedisNotifier/         # Публикация в Redis Streams
├── Types/                 # Типы и интерфейсы
└── Utils/                 # Вспомогательные утилиты
```

### Конвейер обработки

1. **Reader** подключается к SHiP по WebSocket и получает блоки
2. **BlockParser** извлекает actions и deltas из каждого блока
3. **ActionParser** обрабатывает действия через зарегистрированные обработчики
4. **DeltaParser** обрабатывает дельты таблиц через соответствующие обработчики
5. **ForkParser** следит за форками и корректирует данные
6. Результаты сохраняются в **MongoDB** и публикуются в **Redis Streams**

## Ключевые зависимости

- **@blockmatic/eosio-ship-reader** — библиотека чтения SHiP
- **eosjs** — взаимодействие с блокчейном EOSIO
- **mongodb** — хранилище индексированных данных
- **ioredis** — публикация событий в Redis Streams
- **express** — REST API
- **ws** — WebSocket-клиент
- **unbuild** — сборка библиотеки

## Лицензия

[BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.ru)
