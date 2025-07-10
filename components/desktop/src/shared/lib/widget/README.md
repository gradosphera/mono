# Widget System

> Система для встраивания Quasar приложения в виде iframe на внешние сайты

## Что это?

Widget система позволяет встраивать ваше Quasar приложение на любые внешние сайты как iframe с полноценной двусторонней коммуникацией и автоматическим определением widget режима.

## Основные возможности

- ✅ **SSR совместимость** - работает в Server-Side Rendering
- ✅ **Автоматическое определение** - iframe режим определяется автоматически
- ✅ **Безопасная коммуникация** - PostMessage с валидацией origin
- ✅ **Динамический layout** - автоматическое переключение между обычным и widget layout
- ✅ **Event-driven архитектура** - полная система событий
- ✅ **Настраиваемые темы** - поддержка light/dark режимов
- ✅ **Responsive design** - адаптивность под размер контейнера

## Быстрый старт

### 1. Встраивание на внешний сайт

```html
<!-- Минимальный код для встраивания -->
<div id="widget-container" style="width: 100%; height: 500px;"></div>
<script>
  const iframe = document.createElement('iframe');
  iframe.src = 'https://your-app.com?widget=true';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  document.getElementById('widget-container').appendChild(iframe);
</script>
```

### 2. Использование в Vue компоненте

```vue
<template>
  <div v-if="isWidget" class="widget-mode">
    <p>Это widget режим!</p>
    <button @click="sendData({ hello: 'world' })">Отправить данные</button>
  </div>
</template>

<script setup>
import { useWidgetBridge } from 'src/shared/lib/widget';

const { isWidget, isReady, sendData } = useWidgetBridge();
</script>
```

## Структура файлов

```
src/shared/lib/widget/
├── README.md                    # Этот файл
├── WIDGET_ARCHITECTURE.md       # Подробная техническая документация
├── WIDGET_INTEGRATION_GUIDE.md  # Практическое руководство по интеграции
├── index.ts                     # Экспорты
├── types.ts                     # TypeScript типы
├── widget.ts                    # Основная конфигурация
├── widget-mode.ts               # Определение widget режима
├── postmessage-bridge.ts        # Коммуникация PostMessage
├── use-widget-bridge.ts         # Vue композабл
└── widget-events.ts             # Система событий
```

## Как это работает

### 1. Автоматическое определение

```typescript
// Система автоматически определяет widget режим по:
const isInIframe = window.parent !== window;
const hasWidgetParam =
  new URLSearchParams(window.location.search).get('widget') === 'true';
const isWidget = isInIframe || hasWidgetParam;
```

### 2. Динамический layout

```typescript
// Автоматически переключается между layouts
const LayoutComponent = isWidgetMode ? WidgetLayout : DefaultLayout;
```

### 3. Безопасная коммуникация

```typescript
// Валидация origin для безопасности
function isOriginAllowed(origin: string, allowedOrigins: string[]) {
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}
```

## Основные компоненты

### WidgetMode

Определяет и управляет widget режимом:

- Singleton с lazy инициализацией
- Автоматическое определение iframe режима
- Управление конфигурацией

### PostMessageBridge

Обеспечивает безопасную коммуникацию:

- Валидация origin
- Очередь сообщений
- Система подписок

### useWidgetBridge

Vue композабл для работы с widget:

- Реактивное состояние
- Методы отправки данных
- Система событий

## Типы сообщений

```typescript
// Исходящие (из widget)
WIDGET_READY: 'widget:ready'; // Widget готов к работе
WIDGET_DATA_CHANGE: 'widget:data-change'; // Данные изменились
WIDGET_ERROR: 'widget:error'; // Произошла ошибка
WIDGET_NAVIGATE: 'widget:navigate'; // Навигация в widget
WIDGET_RESIZE: 'widget:resize'; // Изменение размера

// Входящие (в widget)
WIDGET_INIT: 'widget:init'; // Инициализация widget
WIDGET_SET_DATA: 'widget:set-data'; // Установка данных
WIDGET_GET_DATA: 'widget:get-data'; // Запрос данных
WIDGET_NAVIGATE_TO: 'widget:navigate-to'; // Команда навигации
WIDGET_UPDATE_CONFIG: 'widget:update-config'; // Обновление конфигурации
```

## Конфигурация

```typescript
interface IWidgetConfig {
  enabled: boolean; // Включена ли widget система
  allowedOrigins: string[]; // Разрешенные домены
  disableNavigation: boolean; // Отключить навигацию
  hideHeader: boolean; // Скрыть header
  hideFooter: boolean; // Скрыть footer
  theme: 'light' | 'dark'; // Тема оформления
  locale: string; // Локаль
  maxWidth: string; // Максимальная ширина
  maxHeight: string; // Максимальная высота
}
```

## Примеры использования

### Отправка данных в родительское окно

```typescript
const { sendData } = useWidgetBridge();

// Отправка пользовательских данных
sendData({
  type: 'user-registered',
  user: { id: 123, email: 'user@example.com' },
});
```

### Обработка событий от родительского окна

```typescript
const { on } = useWidgetBridge();

// Слушаем команды от родительского сайта
on('update-user-data', (userData) => {
  console.log('Received user data:', userData);
});
```

### Отслеживание навигации

```typescript
const { sendNavigation } = useWidgetBridge();

// При изменении маршрута
router.afterEach((to) => {
  if (isWidget.value) {
    sendNavigation(to.fullPath);
  }
});
```

## Безопасность

### Валидация origin

```typescript
// Настройка разрешенных доменов
const config = {
  allowedOrigins: [
    'https://trusted-site.com',
    'https://app.partner.com',
    '*.company.com', // Wildcard поддержка
  ],
};
```

### Валидация сообщений

```typescript
// Проверка структуры сообщений
function isValidWidgetMessage(message: any) {
  return (
    message?.type &&
    message?.timestamp &&
    Object.values(WIDGET_MESSAGE_TYPES).includes(message.type)
  );
}
```

## Отладка

### Включение debug режима

```typescript
// В конфигурации
const config = {
  debug: true, // Включает подробное логирование
};
```

### Проверка состояния

```typescript
// В browser console
console.log('Widget state:', widgetModeInstance.getState());
console.log('Is widget:', isWidget.value);
console.log('Is ready:', isReady.value);
```

## Troubleshooting

### "window is not defined"

- **Причина**: Обращение к browser API в SSR
- **Решение**: Добавить проверку `typeof window !== 'undefined'`

### Widget не определяется

- **Причина**: Неправильные URL параметры
- **Решение**: Проверить `?widget=true` в URL

### PostMessage не работает

- **Причина**: Неправильный origin
- **Решение**: Добавить домен в `allowedOrigins`

## Производительность

- **Lazy инициализация** - компоненты загружаются только при необходимости
- **Tree shaking** - неиспользуемые части удаляются при сборке
- **Минимальный bundle** - только необходимые зависимости
- **Кэширование** - переиспользование экземпляров

## Совместимость

- **Vue 3** - полная поддержка Composition API
- **Quasar 2** - интеграция с экосистемой
- **TypeScript** - полная типизация
- **SSR** - поддержка Server-Side Rendering
- **PWA** - работа в Progressive Web Apps

## Дополнительные ресурсы

- [WIDGET_ARCHITECTURE.md](./WIDGET_ARCHITECTURE.md) - подробная техническая документация
- [WIDGET_INTEGRATION_GUIDE.md](./WIDGET_INTEGRATION_GUIDE.md) - практическое руководство
- [Vue Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Quasar Framework](https://quasar.dev/)

## Лицензия

MIT License - см. файл LICENSE в корне проекта.
