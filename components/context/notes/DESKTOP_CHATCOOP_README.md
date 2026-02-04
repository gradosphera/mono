# ChatCoop Extension

Расширение для интеграции Matrix чата в кооперативную систему.

## Описание

ChatCoop предоставляет встроенный Matrix чат для пользователей кооператива. Расширение:

- Получает временный токен аутентификации через GraphQL API
- Отображает Matrix клиент (Element Web) в iframe
- Автоматически аутентифицирует пользователя с полученным токеном

## Структура

```
chatcoop/
├── install.ts                    # Конфигурация рабочего стола
├── entities/
│   └── ChatCoopChat/             # Entity для работы с Matrix токенами
│       ├── api/                  # GraphQL запросы через SDK
│       └── model/                # Store и типы данных из SDK
├── pages/
│   └── ChatCoopPage/             # Главная страница с iframe
├── shared/                       # Общие компоненты
└── widgets/                      # Виджеты
```

## SDK интеграция

Расширение использует типизированные запросы из SDK:

- **Query**: `Queries.ChatCoop.GetToken`
- **Selector**: `chatcoopTokenSelector`
- **Типы**: Автоматически генерируются из GraphQL схемы

## Работа с iframe URL

1. При загрузке страницы вызывается `chatcoopStore.loadToken()`
2. Entity отправляет типизированный GraphQL запрос через SDK: `Queries.ChatCoop.GetToken`
3. Бэкенд проверяет/создает Matrix пользователя и генерирует токен
4. Бэкенд формирует полную iframe URL с токеном аутентификации
5. Store сохраняет полученную ссылку в состоянии (типизировано через SDK)
6. Страница загружает iframe с готовой ссылкой
7. Пользователь автоматически входит в Matrix чат

## Конфигурация

- **MATRIX_CLIENT_URL**: URL Element Web клиента
- **workspace**: 'chatcoop'
- **defaultRoute**: 'chat'

## Архитектура

Расширение построено по принципам Feature-Sliced Design (FSD):

- **Entities**: `ChatCoopChat` - бизнес-сущность для работы с Matrix токенами
- **Pages**: `ChatCoopPage` - UI страница без бизнес-логики
- **Store**: Pinia store для управления состоянием токена
- **API**: Функции для GraphQL запросов

## Зависимости

- GraphQL API с resolver `getToken`
- Matrix Synapse сервер
- Element Web клиент
