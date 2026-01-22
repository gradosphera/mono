# Архитектура Widget Системы

## Оглавление

1. [Обзор архитектуры](#обзор-архитектуры)
2. [SSR совместимость](#ssr-совместимость)
3. [Компоненты системы](#компоненты-системы)
4. [Жизненный цикл виджета](#жизненный-цикл-виджета)
5. [Коммуникация PostMessage](#коммуникация-postmessage)
6. [Безопасность](#безопасность)
7. [Layout переключение](#layout-переключение)
8. [Event система](#event-система)
9. [Примеры использования](#примеры-использования)
10. [Troubleshooting](#troubleshooting)

## Обзор архитектуры

Widget система представляет собой комплексное решение для встраивания Quasar приложения в виде iframe на внешние сайты с полноценной двусторонней коммуникацией.

### Основные принципы:

1. **SSR-совместимость** - система работает как на клиенте, так и в SSR режиме
2. **Автоматическое определение** - iframe режим определяется автоматически
3. **Безопасная коммуникация** - PostMessage с валидацией origin
4. **Динамический layout** - автоматическое переключение между обычным и widget layout
5. **Event-driven архитектура** - система событий для взаимодействия

### Диаграмма архитектуры:

```
┌─────────────────┐    PostMessage    ┌─────────────────┐
│   Parent Site   │ ◄──────────────►  │   Widget App    │
│                 │                   │                 │
│ ┌─────────────┐ │                   │ ┌─────────────┐ │
│ │ Widget SDK  │ │                   │ │Widget Bridge│ │
│ │ (External)  │ │                   │ │ (Internal)  │ │
│ └─────────────┘ │                   │ └─────────────┘ │
│                 │                   │                 │
│ ┌─────────────┐ │                   │ ┌─────────────┐ │
│ │   iframe    │ │                   │ │Widget Layout│ │
│ │             │ │                   │ │             │ │
│ └─────────────┘ │                   │ └─────────────┘ │
└─────────────────┘                   └─────────────────┘
```

## SSR совместимость

### Проблема

В SSR режиме объект `window` не существует, что приводило к ошибкам при инициализации widget системы.

### Решение

Система использует **lazy инициализацию** и **client-only checks**:

```typescript
// Проверка на существование window (для SSR)
const isClient = typeof window !== 'undefined';

// Все операции с DOM выполняются только на клиенте
if (isClient) {
  // код работы с window, document, etc.
}
```

### Стратегия инициализации:

1. **На сервере**: Создаются только реактивные состояния без обращений к browser API
2. **На клиенте**: Выполняется полная инициализация через `forceInitialize()`
3. **Lazy singleton**: Widget экземпляры создаются только при первом обращении

## Компоненты системы

### 1. WidgetMode (widget-mode.ts)

**Назначение**: Определение и управление widget режимом

**Ключевые особенности**:

- Singleton pattern с lazy инициализацией
- Автоматическое определение iframe режима
- Управление CSS стилями и темами
- Конфигурация widget поведения

**Методы**:

```typescript
class WidgetMode {
  static getInstance(): WidgetMode;
  getState(): IWidgetState;
  updateConfig(config: Partial<IWidgetConfig>): void;
  forceInitialize(): void; // Принудительная инициализация на клиенте
  static createWidgetUrl(baseUrl: string, options: object): string;
}
```

**Определение widget режима**:

```typescript
private detectWidgetMode(): void {
  if (!isClient) return; // SSR защита

  const urlParams = new URLSearchParams(window.location.search);
  const isInIframe = window.parent !== window;
  const widgetModeParam = urlParams.get(WIDGET_URL_PARAMS.WIDGET_MODE);

  // Widget режим определяется по:
  // 1. Наличию iframe (window.parent !== window)
  // 2. URL параметру ?widget=true
  widgetState.isWidget = isInIframe || widgetModeParam === 'true';
}
```

### 2. PostMessageBridge (postmessage-bridge.ts)

**Назначение**: Безопасная коммуникация между iframe и родительским окном

**Функциональность**:

- Валидация origin для безопасности
- Очередь сообщений до готовности
- Система подписок на события
- Автоматическая сериализация данных

**Типы сообщений**:

```typescript
const WIDGET_MESSAGE_TYPES = {
  // Исходящие (из виджета)
  WIDGET_READY: 'widget:ready',
  WIDGET_DATA_CHANGE: 'widget:data-change',
  WIDGET_ERROR: 'widget:error',
  WIDGET_NAVIGATE: 'widget:navigate',
  WIDGET_RESIZE: 'widget:resize',

  // Входящие (в виджет)
  WIDGET_INIT: 'widget:init',
  WIDGET_SET_DATA: 'widget:set-data',
  WIDGET_GET_DATA: 'widget:get-data',
  WIDGET_NAVIGATE_TO: 'widget:navigate-to',
  WIDGET_UPDATE_CONFIG: 'widget:update-config',
  WIDGET_DESTROY: 'widget:destroy',
};
```

**Безопасность коммуникации**:

```typescript
private handleMessage(event: MessageEvent) {
  // 1. Проверка origin
  if (!isOriginAllowed(event.origin, this.config.allowedOrigins)) {
    console.warn(`Blocked message from unauthorized origin: ${event.origin}`);
    return;
  }

  // 2. Валидация структуры сообщения
  if (!isValidWidgetMessage(event.data)) {
    console.warn('Invalid message format:', event.data);
    return;
  }

  // 3. Обработка сообщения
  this.processMessage(event.data);
}
```

### 3. useWidgetBridge (use-widget-bridge.ts)

**Назначение**: Vue композабл для работы с widget bridge

**Возможности**:

- Реактивное состояние widget
- Методы отправки данных
- Система событий
- Автоматическое отслеживание размеров

**Пример использования**:

```typescript
const {
  isReady,
  isWidget,
  widgetData,
  config,
  sendData,
  sendError,
  sendNavigation,
  sendResize,
  on,
  off,
} = useWidgetBridge();

// Отправка данных
if (isWidget.value && isReady.value) {
  sendData({ user: userData });
}

// Подписка на события
on('data-change', (data) => {
  console.log('Received data:', data);
});
```

### 4. DynamicLayoutWrapper (routes/index.ts)

**Назначение**: Динамическое переключение layout в зависимости от режима

**Реализация**:

```typescript
const DynamicLayoutWrapper = defineComponent({
  name: 'DynamicLayoutWrapper',
  setup() {
    // Определяем widget режим только на клиенте
    const isWidgetMode =
      typeof window !== 'undefined' &&
      (window.parent !== window ||
        new URLSearchParams(window.location.search).get('widget') === 'true');

    return () => {
      const LayoutComponent = isWidgetMode ? widgetLayout : layout;
      return h(LayoutComponent);
    };
  },
});
```

**Преимущества**:

- Автоматическое определение layout
- SSR совместимость
- Нет необходимости в ручном переключении

## Жизненный цикл виджета

### 1. Инициализация (Server-Side)

```typescript
// На сервере создаются только реактивные состояния
const widgetState = reactive({
  isWidget: false,
  isReady: false,
  parentOrigin: '',
  config: { ...DEFAULT_WIDGET_CONFIG },
});
```

### 2. Hydration (Client-Side)

```typescript
// В boot файле на клиенте
if (typeof window !== 'undefined') {
  // Принудительная инициализация
  widgetModeInstance.forceInitialize();

  const widgetState = widgetModeInstance.getState();

  if (widgetState.isWidget.value) {
    // Инициализация widget режима
    widgetEventManager.initialize();
  }
}
```

### 3. Widget Detection

```typescript
private detectWidgetMode(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const isInIframe = window.parent !== window;
  const widgetModeParam = urlParams.get('widget');

  widgetState.isWidget = isInIframe || widgetModeParam === 'true';

  if (widgetState.isWidget) {
    this.initializeWidgetMode(urlParams);
  }
}
```

### 4. Bridge Setup

```typescript
if (checkIfWidget()) {
  isWidget.value = true;
  bridge = new PostMessageBridge(config);

  // Подписка на события
  bridge.on('ready', (data) => {
    isReady.value = true;
    widgetData.value = data;
  });
}
```

### 5. Layout Application

```typescript
// В DynamicLayoutWrapper
const isWidgetMode =
  typeof window !== 'undefined' &&
  (window.parent !== window ||
    new URLSearchParams(window.location.search).get('widget') === 'true');

const LayoutComponent = isWidgetMode ? widgetLayout : layout;
```

### 6. Communication Ready

```typescript
// Отправка сообщения о готовности
this.sendMessage(WIDGET_MESSAGE_TYPES.WIDGET_READY, {
  config: this.config,
  timestamp: Date.now(),
});
```

## Коммуникация PostMessage

### Отправка сообщений

```typescript
public sendMessage(type: WidgetMessageType, data?: any, id?: string) {
  if (!isClient) return; // SSR защита

  const message = createWidgetMessage(type, data, id);

  if (this.isReady) {
    this.sendMessageToParent(message);
  } else {
    // Сообщения в очереди до готовности
    this.messageQueue.push(message);
  }
}
```

### Получение сообщений

```typescript
private handleMessage(event: MessageEvent) {
  // Origin validation
  if (!isOriginAllowed(event.origin, this.config.allowedOrigins)) {
    return;
  }

  // Message validation
  if (!isValidWidgetMessage(event.data)) {
    return;
  }

  // Processing
  this.processMessage(event.data);
}
```

### Очередь сообщений

```typescript
private processMessageQueue() {
  while (this.messageQueue.length > 0) {
    const message = this.messageQueue.shift();
    if (message) {
      this.sendMessageToParent(message);
    }
  }
}
```

## Безопасность

### 1. Origin Validation

```typescript
export function isOriginAllowed(
  origin: string,
  allowedOrigins: string[],
): boolean {
  if (allowedOrigins.includes('*')) return true;

  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}
```

### 2. Message Validation

```typescript
export function isValidWidgetMessage(message: any): message is IWidgetMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof message.type === 'string' &&
    typeof message.timestamp === 'number' &&
    Object.values(WIDGET_MESSAGE_TYPES).includes(message.type)
  );
}
```

### 3. Sandbox Attributes

```typescript
iframe.setAttribute(
  'sandbox',
  'allow-scripts allow-same-origin allow-forms allow-popups',
);
```

## Layout переключение

### Widget Layout Features

```scss
.widget-layout {
  // Убираем все лишние отступы
  &.q-layout {
    min-height: auto;
  }

  // Компактный header
  .widget-header {
    min-height: 40px;
  }

  // Компактный footer
  .widget-footer {
    min-height: 30px;
  }

  // Основная страница виджета
  .widget-page {
    padding: 8px;
    min-height: auto;
  }

  // Темы
  &.widget-layout--theme-light {
    background: white;
    color: #1a1a1a;
  }

  &.widget-layout--theme-dark {
    background: #1a1a1a;
    color: white;
  }
}
```

### Динамическое скрытие элементов

```typescript
private setupWidgetEnvironment(): void {
  if (!isClient) return;

  document.body.classList.add('widget-mode');

  if (widgetState.config.hideHeader) {
    document.body.classList.add('widget-hide-header');
  }

  if (widgetState.config.hideFooter) {
    document.body.classList.add('widget-hide-footer');
  }
}
```

## Event система

### Widget Events

```typescript
export interface WidgetEventHandlers {
  onReady?: (data?: any) => void;
  onDataChange?: (data: any) => void;
  onError?: (error: any) => void;
  onNavigate?: (path: string) => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
  onDestroy?: () => void;
}
```

### Использование событий

```typescript
const { emitEvent, eventHistory } = useWidgetEvents({
  onReady: (data) => {
    console.log('Widget ready:', data);
  },
  onDataChange: (data) => {
    console.log('Data changed:', data);
  },
  onError: (error) => {
    console.error('Widget error:', error);
  },
});

// Отправка пользовательского события
emitEvent('custom-event', { payload: 'data' });
```

### Global Error Handling

```typescript
function setupGlobalErrorHandlers() {
  if (!isClient) return;

  window.addEventListener('error', handleJSError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}
```

## Примеры использования

### 1. Создание iframe виджета

```javascript
// На внешнем сайте
const iframe = document.createElement('iframe');
iframe.src =
  'https://your-app.com?widget=true&widget_config=' +
  encodeURIComponent(
    JSON.stringify({
      theme: 'light',
      hideHeader: true,
      allowedOrigins: [window.location.origin],
    }),
  );
iframe.style.width = '100%';
iframe.style.height = '600px';
iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');

document.getElementById('widget-container').appendChild(iframe);
```

### 2. Использование в Vue компоненте

```vue
<template>
  <div v-if="isWidget" class="widget-content">
    <p>Widget режим активен</p>
    <button @click="sendDataToParent">Отправить данные</button>
  </div>
</template>

<script setup>
import { useWidgetBridge } from 'src/shared/lib/widget';

const { isWidget, isReady, sendData } = useWidgetBridge();

function sendDataToParent() {
  if (isReady.value) {
    sendData({ message: 'Hello from widget!' });
  }
}
</script>
```

### 3. Навигация в widget

```typescript
// В router guard
router.beforeEach((to, from, next) => {
  if (widgetState.isWidget.value) {
    // Отправляем информацию о навигации в родительское окно
    sendNavigation(to.fullPath);
  }
  next();
});
```

## Troubleshooting

### Распространенные проблемы

#### 1. "window is not defined" в SSR

**Причина**: Обращение к browser API на сервере

**Решение**: Добавить проверку `isClient`

```typescript
if (typeof window !== 'undefined') {
  // код для браузера
}
```

#### 2. Widget не определяется

**Причина**: Неправильные URL параметры или iframe настройки

**Диагностика**:

```typescript
console.log('Parent window:', window.parent !== window);
console.log('URL params:', new URLSearchParams(window.location.search));
console.log('Widget state:', widgetModeInstance.getState());
```

#### 3. PostMessage не работает

**Причина**: Проблемы с origin или структурой сообщения

**Диагностика**:

```typescript
// В PostMessageBridge
private handleMessage(event: MessageEvent) {
  console.log('Message received:', {
    origin: event.origin,
    data: event.data,
    allowed: isOriginAllowed(event.origin, this.config.allowedOrigins)
  });
}
```

#### 4. Layout не переключается

**Причина**: Проблемы с DynamicLayoutWrapper

**Проверка**:

```typescript
// В browser console
console.log(
  'Is widget mode:',
  typeof window !== 'undefined' &&
    (window.parent !== window ||
      new URLSearchParams(window.location.search).get('widget') === 'true'),
);
```

#### 5. События не доходят

**Причина**: Неправильная инициализация event системы

**Решение**: Проверить последовательность инициализации

```typescript
// В boot файле
if (widgetState.isWidget.value) {
  widgetEventManager.initialize(); // Должно быть до router setup
}
```

### Debug режим

Для отладки можно включить расширенное логирование:

```typescript
// В widget конфигурации
const config = {
  ...DEFAULT_WIDGET_CONFIG,
  debug: true,
};

// В PostMessageBridge
if (config.debug) {
  console.log('[Widget Debug]', message);
}
```

### Performance мониторинг

```typescript
// Отслеживание производительности
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name.includes('widget')) {
      console.log('Widget performance:', entry);
    }
  });
});

performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
```

## Заключение

Widget система представляет собой надежное и масштабируемое решение для встраивания Quasar приложений. Ключевые преимущества:

- **SSR совместимость** - работает в любом режиме рендеринга
- **Автоматическое определение** - не требует ручной настройки
- **Безопасность** - валидация origin и сообщений
- **Производительность** - lazy инициализация и оптимизация
- **Гибкость** - настраиваемые темы и поведение
- **Надежность** - обработка ошибок и fallback сценарии

Система готова к использованию в production окружении и может быть легко интегрирована в любые веб-сайты.
