# Конфигурация переменных окружения

## Структура файлов

- `env.types.ts` - единые типы для всех переменных окружения
- `env.utils.ts` - утилиты для работы с переменными окружения
- `Environment.ts` - основной интерфейс для клиента
- `index.ts` - единая точка входа для импортов

## Специальные поля

- `CLIENT?: boolean` - доступно только на клиенте (опционально)
- `SERVER?: boolean` - доступно только на сервере SSR (опционально)

## Как добавить новую переменную окружения

### 1. Добавить в типы (`env.types.ts`)

```typescript
export interface EnvVars {
  // ... существующие поля
  NEW_VARIABLE: string;
}
```

### 2. Добавить в утилиты (`env.utils.ts`)

```typescript
export function getEnvVarsForClient(): EnvVars {
  return {
    // ... существующие поля
    NEW_VARIABLE: process.env.NEW_VARIABLE as string,
  };
}
```

### 3. Добавить в декларации Node.js (`pwa-env.d.ts`)

```typescript
export interface ProcessEnvVars {
  // ... существующие поля
  NEW_VARIABLE: string;
}
```

### 4. Добавить в `.env-example` и другие env файлы

```bash
NEW_VARIABLE=default_value
```

### 5. Использование в коде

```typescript
import { env } from '@/shared/config';

// Использование
const newVar = env.NEW_VARIABLE;

// SSR-специфичная логика
if (env.SERVER) {
  // Код для сервера
}

if (env.CLIENT) {
  // Код для клиента
}
```

## Источники переменных окружения

Переменные загружаются в следующем порядке приоритета:

1. **SSR**: Инжектируются в HTML через `window.__APP_CONFIG__`
2. **PWA fallback**: Загружаются синхронно из `/config.js`
3. **Fallback**: Используются `process.env` (для сервера/dev режима)

## Middleware

- `generateConfig.ts` - создаёт `/config.js` и инжектирует переменные в HTML
