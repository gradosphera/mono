# Руководство по миграциям схем расширений

## Обзор

Система миграций расширений позволяет автоматически обновлять конфигурации расширений при изменении их схем. Миграции применяются на основе версий, хранимых в базе данных. Система миграции расширений является отдельной и независимой от основной системы миграций всего приложения.

## Архитектура

### Основные компоненты:
- `ExtensionSchemaMigrationService` - сервис управления миграциями
- `schema_version` - поле в таблице `extensions` для отслеживания версии схемы
- Миграции в папке `src/extensions/[extension]/migrations/`

### Процесс миграции:
1. При запуске расширения проверяется текущая версия в БД
2. Применяются все миграции с версией выше текущей
3. Обновляется версия и конфигурация в БД

## Создание миграции

### 1. Создайте файл миграции
```typescript
// src/extensions/[extension]/migrations/[extension]-schema-v[N].migration.ts
import { IExtensionSchemaMigration } from '~/domain/extension/services/extension-schema-migration.service';

export const [extension]SchemaV[N]Migration: IExtensionSchemaMigration<
  IOldConfig,
  INewConfig
> = {
  extensionName: '[extension]',
  version: N,

  migrate(oldConfig: IOldConfig, defaultConfig: INewConfig): INewConfig {
    // Логика преобразования старой конфигурации в новую
    return { ...defaultConfig, ...transformedConfig };
  },
};
```

### 2. Зарегистрируйте миграцию
```typescript
// src/domain/extension/extension-domain.module.ts
import { [extension]SchemaV[N]Migration } from '~/extensions/[extension]/migrations/[extension]-schema-v[N].migration';

async onModuleInit() {
  this.migrationService.registerMigration([extension]SchemaV[N]Migration);
  // ...
}
```

### 3. Обновите defaultConfig
Убедитесь, что `defaultConfig` в плагине соответствует новой схеме.

### 4. Добавьте pluginClass в реестр
```typescript
// src/extensions/extensions.registry.ts
[extension]: {
  // ...
  pluginClass: [Extension]Plugin,
  // ...
}
```

## Логи миграций

### Успешная миграция:
```
Миграция powerup: v1 → v2
Конфигурация до: {...}
Конфигурация после: {...}
Миграция powerup завершена: v1 → v2
```

### Нет миграций:
Расширение работает с текущей версией без логов.

## Примеры

### Пример 1: Удаление поля
```typescript
migrate(oldConfig: any, defaultConfig: any) {
  const { removedField, ...rest } = oldConfig;
  return { ...defaultConfig, ...rest };
}
```

### Пример 2: Переименование поля
```typescript
migrate(oldConfig: any, defaultConfig: any) {
  return {
    ...defaultConfig,
    ...oldConfig,
    newFieldName: oldConfig.oldFieldName,
    oldFieldName: undefined, // удаляем старое поле
  };
}
```

### Пример 3: Преобразование значений
```typescript
migrate(oldConfig: any, defaultConfig: any) {
  return {
    ...defaultConfig,
    ...oldConfig,
    thresholds: oldConfig.absoluteValues ?
      { cpu: 70, net: 70, ram: 70 } : // дефолтные проценты
      oldConfig.thresholds
  };
}
```

## Запуск миграций

Миграции запускаются автоматически при старте приложения для каждого включенного расширения. Ручной запуск не требуется.

## Отладка

Если миграция не применяется:
1. Проверьте логи запуска приложения
2. Убедитесь, что расширение включено (`enabled: true`)
3. Проверьте наличие `pluginClass` в реестре
4. Проверьте корректность `defaultConfig` в плагине

## Безопасность

- Миграции применяются только вперед (от низшей версии к высшей)
- Исходная конфигурация сохраняется до успешного применения миграции
- При ошибке в миграции расширение не запускается
