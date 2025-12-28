# Добавление новой переменной окружения

Переменные окружения должны быть доступны на клиенте, но `process.env` работает только на сервере. В браузере переменные передаются через инъекцию в HTML или отдельные JS-файлы.

**SPA режим** (локальная разработка): использует `process.env` напрямую из Node.js.

**SSR режим**: инжектирует переменные в HTML через middleware `generateConfig.ts`, создавая `window.__APP_CONFIG__`.

**PWA режим**: загружает конфигурацию через синхронный XMLHttpRequest из `/config.js` или использует `config.default.js` как fallback для офлайн.

Поэтому переменная должна быть определена во всех местах: типы, создание объекта, middlewares, примеры и fallback'ы.

## Список файлов для изменений

### 1. Типы TypeScript
**`src/shared/config/Environment.ts`** - добавить в интерфейс `EnvVars`:
```typescript
export interface EnvVars {
  // ... существующие поля
  NEW_VARIABLE: string;
}
```

### 2. PWA типы
**`src-pwa/pwa-env.d.ts`** - добавить в `ProcessEnv`:
```typescript
interface ProcessEnv {
  // ... существующие поля
  NEW_VARIABLE: string;
}
```

### 3. Функция создания объекта
**`src/shared/config/createEnvObject.ts`** - добавить в функцию:
```typescript
export function createEnvObject(): EnvVars {
  return {
    // ... существующие поля
    NEW_VARIABLE: process.env.NEW_VARIABLE as string,
  };
}
```

### 4. SSR middleware
**`src-ssr/middlewares/generateConfig.ts`** - добавить в `getEnvForClient`:
```typescript
const getEnvForClient = (): EnvVars => ({
  // ... существующие поля
  NEW_VARIABLE: process.env.NEW_VARIABLE as string,
});
```

### 5. Примеры значений
**`../../boot/.env-example`** - добавить переменную:
```bash
# ... существующие переменные
NEW_VARIABLE=default_value
```

### 6. PWA fallback
**`public/config.default.js`** - добавить в `window.__APP_CONFIG__`:
```javascript
window.__APP_CONFIG__ = {
  // ... существующие поля
  NEW_VARIABLE: 'default_value',
};
```

### 7. Quasar config (опционально)
**`quasar.config.cjs`** - если нужно в HTML переменных:
```javascript
htmlVariables: {
  // ... существующие переменные
  NEW_VARIABLE: process.env.NEW_VARIABLE || 'default',
}
```

## Порядок действий

1. Добавить в `EnvVars` интерфейс (файл 1)
2. Добавить в PWA типы (файл 2)
3. Добавить в функцию создания (файл 3)
4. Добавить в SSR middleware (файл 4)
5. Добавить в примеры .env (файл 5)
6. Добавить в PWA fallback (файл 6)
7. Опционально добавить в quasar.config (файл 7)

## Важно
- **Всегда добавляйте во все 6 файлов** - иначе переменная не будет работать
- **Тестируйте в SPA, SSR и PWA режимах**
- **Используйте строковые типы** для переменных окружения
