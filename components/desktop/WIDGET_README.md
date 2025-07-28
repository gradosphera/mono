# MonoCoop Widget System

Система безопасного встраивания MonoCoop приложения как виджета через iframe.

## Обзор

Widget система позволяет встраивать части MonoCoop приложения на внешние сайты через iframe с безопасной двусторонней коммуникацией через postMessage API.

## Архитектура

### Компоненты системы

1. **Widget Mode** - специальный режим работы приложения для iframe
2. **PostMessage Bridge** - безопасная коммуникация между iframe и родительским окном
3. **JavaScript SDK** - библиотека для встраивания виджетов
4. **Widget Layout** - специальный layout без лишних элементов UI

### Безопасность

- ✅ Проверка origin отправителя
- ✅ Валидация входящих данных
- ✅ Ограничение доступных API методов
- ✅ Sandbox атрибуты для iframe
- ✅ CSP заголовки (рекомендуется)

## Использование

### 1. Подключение SDK

```html
<!-- Подключаем SDK -->
<script src="https://your-domain.com/monocoop-widget-sdk.js"></script>
```

### 2. Создание виджета

```javascript
// Создание виджета
const widget = MonoCoopWidget.create({
  baseUrl: 'https://your-monocoop-app.com',
  containerId: 'widget-container', // или container: document.getElementById('container')
  page: '/signup', // необязательно, начальная страница
  theme: 'light', // 'light' или 'dark'
  width: '100%',
  height: '500px',
  hideHeader: true,
  hideFooter: true,
  autoResize: true,
  allowedOrigins: ['https://your-site.com'], // ВАЖНО: указывайте конкретные домены

  // Начальные данные
  initialData: {
    userId: 123,
    theme: 'light',
    locale: 'ru',
  },
});

// Подписка на события
widget
  .on('ready', (data) => {
    console.log('Widget готов!', data);
  })
  .on('dataChange', (data) => {
    console.log('Данные изменились:', data);
  })
  .on('error', (error) => {
    console.error('Ошибка виджета:', error);
  })
  .on('navigate', (data) => {
    console.log('Навигация:', data);
  })
  .on('resize', (dimensions) => {
    console.log('Размер изменился:', dimensions);
  });

// Монтирование виджета
widget.mount();
```

### 3. Взаимодействие с виджетом

```javascript
// Отправка данных в виджет
widget.setData({
  userId: 456,
  settings: { theme: 'dark' },
});

// Получение данных из виджета
const data = await widget.getData();
console.log('Данные из виджета:', data);

// Навигация внутри виджета
widget.navigateTo('/profile');

// Обновление конфигурации
widget.updateConfig({
  theme: 'dark',
  hideHeader: false,
});

// Уничтожение виджета
widget.destroy();
```

## Конфигурация

### Основные параметры

| Параметр            | Тип               | Обязательный | Описание                              |
| ------------------- | ----------------- | ------------ | ------------------------------------- |
| `baseUrl`           | string            | ✅           | URL MonoCoop приложения               |
| `containerId`       | string            | ✅\*         | ID контейнера для виджета             |
| `container`         | HTMLElement       | ✅\*         | DOM элемент контейнера                |
| `page`              | string            | ❌           | Начальная страница                    |
| `theme`             | 'light' \| 'dark' | ❌           | Тема оформления                       |
| `width`             | string            | ❌           | Ширина виджета (по умолчанию '100%')  |
| `height`            | string            | ❌           | Высота виджета (по умолчанию '400px') |
| `hideHeader`        | boolean           | ❌           | Скрыть заголовок (по умолчанию true)  |
| `hideFooter`        | boolean           | ❌           | Скрыть футер (по умолчанию true)      |
| `disableNavigation` | boolean           | ❌           | Отключить навигацию                   |
| `autoResize`        | boolean           | ❌           | Автоматическое изменение размера      |
| `allowedOrigins`    | string[]          | ❌           | Разрешенные домены                    |
| `initialData`       | any               | ❌           | Начальные данные                      |
| `loadingText`       | string            | ❌           | Текст загрузки                        |
| `errorText`         | string            | ❌           | Текст ошибки                          |
| `timeout`           | number            | ❌           | Таймаут загрузки в мс                 |

\*Один из параметров `containerId` или `container` обязателен.

### Sandbox атрибуты

По умолчанию используются следующие sandbox атрибуты:

- `allow-scripts` - разрешить выполнение скриптов
- `allow-same-origin` - разрешить доступ к origin
- `allow-forms` - разрешить отправку форм
- `allow-popups` - разрешить всплывающие окна

## События

### Исходящие события (из виджета)

| Событие      | Описание                 | Данные                    |
| ------------ | ------------------------ | ------------------------- |
| `ready`      | Виджет готов к работе    | `{ config, timestamp }`   |
| `dataChange` | Данные изменились        | `any`                     |
| `error`      | Произошла ошибка         | `{ message, stack, ... }` |
| `navigate`   | Навигация внутри виджета | `{ path }`                |
| `resize`     | Изменился размер виджета | `{ width, height }`       |

### Входящие события (в виджет)

| Событие        | Описание              | Данные                   |
| -------------- | --------------------- | ------------------------ |
| `setData`      | Установить данные     | `any`                    |
| `getData`      | Получить данные       | -                        |
| `navigateTo`   | Перейти на страницу   | `string`                 |
| `updateConfig` | Обновить конфигурацию | `Partial<IWidgetConfig>` |
| `destroy`      | Уничтожить виджет     | -                        |

## Примеры использования

### Простой виджет

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Simple Widget</title>
  </head>
  <body>
    <div id="widget"></div>

    <script src="monocoop-widget-sdk.js"></script>
    <script>
      MonoCoopWidget.mount({
        baseUrl: 'https://your-app.com',
        containerId: 'widget',
        page: '/signup',
        allowedOrigins: ['https://your-site.com'],
      });
    </script>
  </body>
</html>
```

### Виджет с взаимодействием

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Interactive Widget</title>
  </head>
  <body>
    <div id="widget"></div>
    <button onclick="sendUserData()">Send User Data</button>
    <button onclick="getUserData()">Get User Data</button>

    <script src="monocoop-widget-sdk.js"></script>
    <script>
      const widget = MonoCoopWidget.create({
        baseUrl: 'https://your-app.com',
        containerId: 'widget',
        allowedOrigins: ['https://your-site.com'],
      });

      widget.on('ready', () => {
        console.log('Widget is ready!');
      });

      widget.on('dataChange', (data) => {
        console.log('New data:', data);
      });

      widget.mount();

      function sendUserData() {
        widget.setData({
          userId: 123,
          name: 'John Doe',
          email: 'john@example.com',
        });
      }

      async function getUserData() {
        const data = await widget.getData();
        console.log('User data:', data);
      }
    </script>
  </body>
</html>
```

## Безопасность

### Рекомендации

1. **Всегда указывайте конкретные домены в `allowedOrigins`**:

   ```javascript
   allowedOrigins: ['https://your-site.com', 'https://subdomain.your-site.com'];
   ```

2. **Используйте HTTPS для всех коммуникаций**

3. **Валидируйте данные на сервере**

4. **Настройте CSP заголовки**:

   ```
   Content-Security-Policy: frame-ancestors 'self' https://trusted-site.com
   ```

5. **Ограничьте доступные страницы виджета**

### Потенциальные уязвимости

- ❌ Использование `allowedOrigins: ['*']` в production
- ❌ Передача конфиденциальных данных через postMessage
- ❌ Отсутствие валидации входящих данных
- ❌ Использование HTTP вместо HTTPS

## Отладка

### Логи

SDK автоматически выводит логи в console с префиксом `[Widget]`:

```javascript
// Включить детальные логи
MonoCoopWidget.create({
  // ...
  debug: true,
});
```

### Проверка состояния

```javascript
// Проверить готовность виджета
console.log('Widget ready:', widget.isReady);

// Получить конфигурацию
console.log('Config:', widget.config);

// Получить историю событий
console.log('Events:', widget.getEventHistory());
```

## Troubleshooting

### Частые проблемы

1. **Виджет не загружается**
   - Проверьте правильность `baseUrl`
   - Убедитесь, что сервер доступен
   - Проверьте CORS настройки

2. **Ошибка "Blocked message from unauthorized origin"**
   - Добавьте домен в `allowedOrigins`
   - Проверьте правильность URL

3. **Виджет не отвечает на сообщения**
   - Проверьте, что виджет в состоянии `ready`
   - Убедитесь, что данные корректно сериализуются

4. **Проблемы с размером**
   - Включите `autoResize: true`
   - Проверьте CSS стили контейнера

## Интеграция с MonoCoop приложением

### Использование в компонентах

```vue
<template>
  <div class="widget-component">
    <div v-if="isWidget">
      <!-- Специальный контент для widget режима -->
      <simplified-interface />
    </div>
    <div v-else>
      <!-- Обычный контент -->
      <full-interface />
    </div>
  </div>
</template>

<script setup>
import { useWidgetBridge } from '@/shared/lib/widget/use-widget-bridge';

const { isWidget, widgetData, sendData } = useWidgetBridge();

// Отправка данных родительскому окну
function handleDataChange(data) {
  if (isWidget.value) {
    sendData(data);
  }
}
</script>
```

### Обработка событий

```javascript
// В main.js или boot файле
import { useWidgetEvents } from '@/shared/lib/widget/widget-events';

const {} = useWidgetEvents({
  onReady: (data) => {
    console.log('Widget готов:', data);
  },
  onDataChange: (data) => {
    // Обработка входящих данных
    store.dispatch('updateWidgetData', data);
  },
  onError: (error) => {
    console.error('Ошибка виджета:', error);
  },
});
```

## Лицензия

MIT License - см. файл LICENSE для подробностей.
