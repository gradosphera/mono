# Руководство по интеграции Widget системы

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Настройка проекта](#настройка-проекта)
3. [Создание widget страниц](#создание-widget-страниц)
4. [Конфигурация безопасности](#конфигурация-безопасности)
5. [Обработка событий](#обработка-событий)
6. [Стилизация widget](#стилизация-widget)
7. [Продвинутые сценарии](#продвинутые-сценарии)
8. [Развертывание](#развертывание)

## Быстрый старт

### 1. Встраивание widget на внешний сайт

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Сайт с виджетом</title>
  </head>
  <body>
    <h1>Мой сайт</h1>

    <!-- Контейнер для widget -->
    <div id="widget-container" style="width: 100%; height: 500px;"></div>

    <script>
      // Создание iframe widget
      function createWidget() {
        const iframe = document.createElement('iframe');

        // URL widget с параметрами
        const widgetUrl = new URL('https://your-monocoop-app.com');
        widgetUrl.searchParams.set('widget', 'true');
        widgetUrl.searchParams.set(
          'widget_config',
          JSON.stringify({
            theme: 'light',
            hideHeader: true,
            hideFooter: true,
            allowedOrigins: [window.location.origin],
          }),
        );

        iframe.src = widgetUrl.toString();
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.setAttribute(
          'sandbox',
          'allow-scripts allow-same-origin allow-forms allow-popups',
        );

        document.getElementById('widget-container').appendChild(iframe);

        // Слушаем сообщения от widget
        window.addEventListener('message', handleWidgetMessage);
      }

      function handleWidgetMessage(event) {
        // Проверяем origin для безопасности
        if (event.origin !== 'https://your-monocoop-app.com') {
          return;
        }

        console.log('Message from widget:', event.data);

        // Обработка разных типов сообщений
        switch (event.data.type) {
          case 'widget:ready':
            console.log('Widget готов к работе');
            break;
          case 'widget:data-change':
            console.log('Данные изменились:', event.data.data);
            break;
          case 'widget:navigate':
            console.log('Навигация в widget:', event.data.data.path);
            break;
          case 'widget:error':
            console.error('Ошибка в widget:', event.data.data);
            break;
        }
      }

      // Запуск widget при загрузке страницы
      document.addEventListener('DOMContentLoaded', createWidget);
    </script>
  </body>
</html>
```

### 2. Использование готового SDK

```html
<script src="https://your-monocoop-app.com/monocoop-widget-sdk.js"></script>
<script>
  const widget = MonoCoopWidget.create({
    baseUrl: 'https://your-monocoop-app.com',
    containerId: 'widget-container',
    page: '/auth/signup',
    theme: 'light',
    allowedOrigins: [window.location.origin],

    // Обработчики событий
    onReady: () => {
      console.log('Widget готов');
    },
    onDataChange: (data) => {
      console.log('Данные:', data);
    },
    onError: (error) => {
      console.error('Ошибка:', error);
    },
  });
</script>
```

## Настройка проекта

### 1. Добавление widget boot файла

Widget система автоматически подключается через boot файл. Убедитесь, что в `quasar.config.cjs` добавлен boot файл:

```javascript
// quasar.config.cjs
module.exports = configure(function (ctx) {
  return {
    boot: ['widget', 'init', 'i18n', 'axios', 'sentry'],
    // ...
  };
});
```

### 2. Конфигурация маршрутов

Маршруты автоматически используют `DynamicLayoutWrapper`, который определяет нужный layout:

```typescript
// src/app/providers/routes/index.ts
const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DynamicLayoutWrapper, // Автоматически выбирает layout
    name: 'base',
    children: [
      // ваши маршруты
    ],
  },
];
```

### 3. Widget meta данные

Добавьте meta данные для widget режима в маршруты:

```typescript
{
  path: ':coopname/auth/signin',
  name: 'signin',
  component: SignInPage,
  meta: {
    title: 'Вход',
    icon: 'fa-solid fa-sign-in-alt',
    widget: {
      title: 'Вход в систему',
      hideHeader: true,
      hideFooter: true,
    }
  }
}
```

## Создание widget страниц

### 1. Компонент с widget поддержкой

```vue
<template>
  <q-page class="auth-page" :class="{ 'widget-mode': isWidget }">
    <div class="auth-container">
      <!-- Скрытый заголовок в widget режиме -->
      <h1 v-if="!isWidget || !config.hideHeader" class="auth-title">
        {{ pageTitle }}
      </h1>

      <!-- Форма входа -->
      <q-form @submit="onSubmit" class="auth-form">
        <q-input
          v-model="email"
          type="email"
          label="Email"
          :rules="[(val) => !!val || 'Email обязателен']"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="password"
          type="password"
          label="Пароль"
          :rules="[(val) => !!val || 'Пароль обязателен']"
          outlined
          class="q-mb-md"
        />

        <q-btn
          type="submit"
          color="primary"
          label="Войти"
          class="full-width"
          :loading="loading"
        />
      </q-form>

      <!-- Ссылки навигации только в обычном режиме -->
      <div v-if="!isWidget" class="auth-links">
        <router-link to="/auth/signup">Регистрация</router-link>
        <router-link to="/auth/lost-key">Забыли пароль?</router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWidgetBridge } from 'src/shared/lib/widget';

// Widget integration
const { isWidget, isReady, config, sendData, sendError, sendNavigation } =
  useWidgetBridge();

// Form data
const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

// Computed
const pageTitle = computed(() => {
  return isWidget.value ? config.title || 'Вход' : 'Вход в систему';
});

// Methods
async function onSubmit() {
  loading.value = true;

  try {
    // Логика аутентификации
    const result = await authenticate(email.value, password.value);

    if (isWidget.value && isReady.value) {
      // Отправляем данные в родительское окно
      sendData({
        type: 'auth-success',
        user: result.user,
        token: result.token,
      });

      // Уведомляем о навигации
      sendNavigation('/dashboard');
    } else {
      // Обычная навигация
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Auth error:', error);

    if (isWidget.value && isReady.value) {
      // Отправляем ошибку в родительское окно
      sendError({
        type: 'auth-error',
        message: error.message,
      });
    }
  } finally {
    loading.value = false;
  }
}

async function authenticate(email: string, password: string) {
  // Ваша логика аутентификации
  return { user: { email }, token: 'jwt-token' };
}
</script>

<style lang="scss" scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;

  &.widget-mode {
    min-height: auto;
    padding: 0.5rem;
  }
}

.auth-container {
  width: 100%;
  max-width: 400px;

  .widget-mode & {
    max-width: none;
  }
}

.auth-title {
  text-align: center;
  margin-bottom: 2rem;

  .widget-mode & {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
}

.auth-form {
  .widget-mode & {
    .q-field {
      margin-bottom: 0.75rem;
    }
  }
}

.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;

  a {
    color: var(--q-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
```

### 2. Обработка данных в widget

```typescript
// Композабл для работы с widget данными
export function useWidgetAuth() {
  const { isWidget, isReady, sendData, sendError, on } = useWidgetBridge();

  // Слушаем команды от родительского окна
  on('set-user-data', (userData) => {
    // Предзаполнение формы
    console.log('Received user data:', userData);
  });

  on('logout', () => {
    // Выход из системы
    performLogout();
  });

  function sendAuthResult(result: {
    success: boolean;
    user?: any;
    error?: string;
  }) {
    if (isWidget.value && isReady.value) {
      sendData({
        type: 'auth-result',
        ...result,
      });
    }
  }

  function sendAuthError(error: Error) {
    if (isWidget.value && isReady.value) {
      sendError({
        type: 'auth-error',
        message: error.message,
        stack: error.stack,
      });
    }
  }

  return {
    isWidget,
    sendAuthResult,
    sendAuthError,
  };
}
```

## Конфигурация безопасности

### 1. Настройка allowed origins

```typescript
// src/shared/config/widget.ts
export const DEFAULT_WIDGET_CONFIG: IWidgetConfig = {
  enabled: false,
  allowedOrigins: [
    'https://mysite.com',
    'https://app.mysite.com',
    '*.mycompany.com', // Поддержка wildcard доменов
    'http://localhost:3000', // Для разработки
  ],
  disableNavigation: false,
  hideHeader: true,
  hideFooter: true,
  theme: 'light',
  locale: 'ru',
};
```

### 2. Валидация в runtime

```typescript
// Дополнительная валидация в компоненте
function validateWidgetConfig() {
  const currentOrigin = window.location.origin;
  const referrer = document.referrer;

  // Проверяем, что widget запущен с разрешенного домена
  if (isWidget.value && referrer) {
    const referrerOrigin = new URL(referrer).origin;

    if (
      !config.allowedOrigins.includes(referrerOrigin) &&
      !config.allowedOrigins.includes('*')
    ) {
      console.warn('Widget launched from unauthorized origin:', referrerOrigin);
      // Можно заблокировать функциональность или показать предупреждение
    }
  }
}
```

### 3. CSP заголовки

```nginx
# nginx конфигурация для widget
location / {
    # Разрешаем iframe встраивание только с определенных доменов
    add_header X-Frame-Options "ALLOW-FROM https://trusted-site.com";

    # Или используем Content-Security-Policy
    add_header Content-Security-Policy "frame-ancestors 'self' https://trusted-site.com https://*.mycompany.com";

    # Отключаем referrer для безопасности
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

## Обработка событий

### 1. Глобальные события widget

```typescript
// src/shared/lib/widget/global-events.ts
export function setupGlobalWidgetEvents() {
  const { isWidget, sendData, sendError } = useWidgetBridge();

  if (!isWidget.value) return;

  // Отслеживание ошибок
  window.addEventListener('error', (event) => {
    sendError({
      type: 'js-error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      stack: event.error?.stack,
    });
  });

  // Отслеживание unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    sendError({
      type: 'unhandled-rejection',
      reason: event.reason,
    });
  });

  // Отслеживание навигации
  window.addEventListener('popstate', () => {
    sendData({
      type: 'navigation',
      path: window.location.pathname,
    });
  });

  // Отслеживание изменения видимости
  document.addEventListener('visibilitychange', () => {
    sendData({
      type: 'visibility-change',
      visible: !document.hidden,
    });
  });
}
```

### 2. Пользовательские события

```typescript
// В любом компоненте
export function useCustomWidgetEvents() {
  const { isWidget, sendData } = useWidgetBridge();

  function trackUserAction(action: string, data?: any) {
    if (isWidget.value) {
      sendData({
        type: 'user-action',
        action,
        data,
        timestamp: Date.now(),
      });
    }
  }

  function trackFormSubmission(formName: string, success: boolean, data?: any) {
    if (isWidget.value) {
      sendData({
        type: 'form-submission',
        formName,
        success,
        data,
        timestamp: Date.now(),
      });
    }
  }

  return {
    trackUserAction,
    trackFormSubmission,
  };
}
```

### 3. Обработка событий на родительском сайте

```javascript
// На родительском сайте
class WidgetEventHandler {
  constructor(iframe) {
    this.iframe = iframe;
    this.handlers = new Map();

    window.addEventListener('message', this.handleMessage.bind(this));
  }

  handleMessage(event) {
    // Проверяем origin
    if (event.origin !== 'https://your-monocoop-app.com') {
      return;
    }

    const { type, data } = event.data;

    // Вызываем зарегистрированные обработчики
    if (this.handlers.has(type)) {
      this.handlers.get(type).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in widget event handler:', error);
        }
      });
    }
  }

  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  off(eventType, handler) {
    if (this.handlers.has(eventType)) {
      const handlers = this.handlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  sendMessage(type, data) {
    this.iframe.contentWindow.postMessage(
      {
        type,
        data,
        timestamp: Date.now(),
      },
      'https://your-monocoop-app.com',
    );
  }
}

// Использование
const eventHandler = new WidgetEventHandler(iframe);

eventHandler.on('widget:ready', () => {
  console.log('Widget готов к работе');

  // Отправляем начальные данные
  eventHandler.sendMessage('widget:init', {
    user: getCurrentUser(),
    theme: 'dark',
  });
});

eventHandler.on('widget:data-change', (data) => {
  console.log('Данные изменились:', data);

  // Сохраняем данные
  saveUserData(data);
});

eventHandler.on('user-action', (data) => {
  // Отслеживаем действия пользователя
  analytics.track(data.action, data.data);
});
```

## Стилизация widget

### 1. Адаптивные стили

```scss
// src/app/layouts/widget.vue
<style lang="scss" scoped>
.widget-layout {
  // Базовые стили для widget
  min-height: auto;
  overflow: hidden;

  // Адаптивность под размер родительского контейнера
  &.q-layout {
    min-height: auto;
    max-height: 100vh;
  }

  // Компактные размеры для мобильных устройств
  @media (max-width: 600px) {
    .widget-page {
      padding: 4px;
    }

    .widget-header {
      min-height: 35px;

      .q-toolbar {
        min-height: 35px;
        padding: 0 4px;
      }
    }
  }

  // Темы
  &.widget-layout--theme-light {
    background: #ffffff;
    color: #1a1a1a;

    .q-field {
      background: #f5f5f5;
    }
  }

  &.widget-layout--theme-dark {
    background: #1a1a1a;
    color: #ffffff;

    .q-field {
      background: #2a2a2a;
    }
  }

  // Скрытие элементов
  &.widget-hide-header {
    .q-header {
      display: none !important;
    }
  }

  &.widget-hide-footer {
    .q-footer {
      display: none !important;
    }
  }
}
</style>
```

### 2. Динамическое изменение темы

```typescript
// Композабл для управления темой widget
export function useWidgetTheme() {
  const { config, isWidget } = useWidgetBridge();
  const $q = useQuasar();

  // Применяем тему widget
  function applyWidgetTheme() {
    if (!isWidget.value) return;

    const theme = config.theme || 'light';

    // Устанавливаем Quasar тему
    $q.dark.set(theme === 'dark');

    // Применяем CSS классы
    document.body.classList.remove('widget-theme-light', 'widget-theme-dark');
    document.body.classList.add(`widget-theme-${theme}`);

    // Устанавливаем CSS переменные
    const root = document.documentElement;

    if (theme === 'dark') {
      root.style.setProperty('--widget-bg', '#1a1a1a');
      root.style.setProperty('--widget-text', '#ffffff');
      root.style.setProperty('--widget-border', '#3a3a3a');
    } else {
      root.style.setProperty('--widget-bg', '#ffffff');
      root.style.setProperty('--widget-text', '#1a1a1a');
      root.style.setProperty('--widget-border', '#e0e0e0');
    }
  }

  // Слушаем изменения конфигурации
  watch(() => config.theme, applyWidgetTheme, { immediate: true });

  return {
    applyWidgetTheme,
  };
}
```

### 3. Responsive iframe

```javascript
// Автоматическое изменение размера iframe
function createResponsiveWidget() {
  const iframe = document.createElement('iframe');

  // Начальные размеры
  iframe.style.width = '100%';
  iframe.style.height = '400px';
  iframe.style.minHeight = '300px';
  iframe.style.maxHeight = '800px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  iframe.style.transition = 'height 0.3s ease';

  // Слушаем сообщения о изменении размера
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://your-monocoop-app.com') return;

    if (event.data.type === 'widget:resize') {
      const { width, height } = event.data.data;

      // Обновляем размеры iframe
      if (height) {
        iframe.style.height = Math.min(Math.max(height, 300), 800) + 'px';
      }
    }
  });

  return iframe;
}
```

## Продвинутые сценарии

### 1. Многошаговые формы в widget

```vue
<template>
  <q-stepper
    v-model="step"
    vertical
    class="widget-stepper"
    :class="{ compact: isWidget }"
  >
    <q-step :name="1" title="Личные данные" icon="person" :done="step > 1">
      <PersonalDataForm
        v-model="formData.personal"
        @next="nextStep"
        :compact="isWidget"
      />
    </q-step>

    <q-step :name="2" title="Контакты" icon="contact_mail" :done="step > 2">
      <ContactForm
        v-model="formData.contact"
        @next="nextStep"
        @prev="prevStep"
        :compact="isWidget"
      />
    </q-step>

    <q-step :name="3" title="Подтверждение" icon="check">
      <ConfirmationForm
        :data="formData"
        @submit="submitForm"
        @prev="prevStep"
        :compact="isWidget"
      />
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useWidgetBridge } from 'src/shared/lib/widget';

const { isWidget, sendData, sendResize } = useWidgetBridge();

const step = ref(1);
const formData = ref({
  personal: {},
  contact: {},
});

// Отправляем информацию о текущем шаге
watch(step, (newStep) => {
  if (isWidget.value) {
    sendData({
      type: 'form-step-change',
      step: newStep,
      totalSteps: 3,
    });
  }
});

function nextStep() {
  step.value++;
  updateHeight();
}

function prevStep() {
  step.value--;
  updateHeight();
}

function updateHeight() {
  // Обновляем высоту iframe при смене шага
  setTimeout(() => {
    if (isWidget.value) {
      const height = document.body.scrollHeight;
      sendResize({ width: 0, height });
    }
  }, 100);
}

async function submitForm() {
  try {
    const result = await api.submitRegistration(formData.value);

    if (isWidget.value) {
      sendData({
        type: 'form-completed',
        result,
      });
    }
  } catch (error) {
    console.error('Form submission error:', error);
  }
}
</script>

<style lang="scss" scoped>
.widget-stepper {
  &.compact {
    .q-stepper__step-inner {
      padding: 8px;
    }

    .q-stepper__title {
      font-size: 0.9rem;
    }
  }
}
</style>
```

### 2. Сохранение состояния между сессиями

```typescript
// Композабл для сохранения состояния widget
export function useWidgetPersistence() {
  const { isWidget, sendData, on } = useWidgetBridge();

  // Сохранение данных в localStorage widget
  function saveWidgetData(key: string, data: any) {
    if (isWidget.value) {
      const storageKey = `widget_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Также отправляем на родительский сайт
      sendData({
        type: 'data-save',
        key,
        data,
      });
    }
  }

  // Загрузка данных из localStorage widget
  function loadWidgetData(key: string) {
    if (isWidget.value) {
      const storageKey = `widget_${key}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  // Очистка данных
  function clearWidgetData(key?: string) {
    if (isWidget.value) {
      if (key) {
        const storageKey = `widget_${key}`;
        localStorage.removeItem(storageKey);
      } else {
        // Очищаем все widget данные
        Object.keys(localStorage)
          .filter((k) => k.startsWith('widget_'))
          .forEach((k) => localStorage.removeItem(k));
      }
    }
  }

  // Слушаем команды от родительского сайта
  on('load-data', (data) => {
    // Восстанавливаем данные от родительского сайта
    Object.entries(data).forEach(([key, value]) => {
      saveWidgetData(key, value);
    });
  });

  return {
    saveWidgetData,
    loadWidgetData,
    clearWidgetData,
  };
}
```

### 3. Аналитика и метрики

```typescript
// Отслеживание метрик widget
export function useWidgetAnalytics() {
  const { isWidget, sendData } = useWidgetBridge();

  function trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
  ) {
    const eventData = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
    };

    if (isWidget.value) {
      // Отправляем в родительское окно для объединения с их аналитикой
      sendData({
        type: 'analytics-event',
        ...eventData,
      });
    } else {
      // Обычная аналитика
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  function trackPageView(page: string) {
    if (isWidget.value) {
      sendData({
        type: 'analytics-pageview',
        page,
        timestamp: Date.now(),
      });
    } else {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page,
      });
    }
  }

  function trackTiming(category: string, variable: string, time: number) {
    if (isWidget.value) {
      sendData({
        type: 'analytics-timing',
        category,
        variable,
        time,
        timestamp: Date.now(),
      });
    } else {
      gtag('event', 'timing_complete', {
        name: variable,
        value: time,
        event_category: category,
      });
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackTiming,
  };
}
```

## Развертывание

### 1. Production конфигурация

```typescript
// src/shared/config/widget.ts
const PRODUCTION_CONFIG: IWidgetConfig = {
  enabled: true,
  allowedOrigins: [
    'https://partner1.com',
    'https://partner2.com',
    'https://app.partner3.com',
    '*.partners.com',
  ],
  disableNavigation: false,
  hideHeader: true,
  hideFooter: true,
  theme: 'light',
  locale: 'ru',
  maxWidth: '1200px',
  maxHeight: '800px',
};

// Environment-specific конфигурация
export const getWidgetConfig = (): IWidgetConfig => {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'staging':
      return {
        ...PRODUCTION_CONFIG,
        allowedOrigins: [
          ...PRODUCTION_CONFIG.allowedOrigins,
          'https://staging.partner1.com',
          'http://localhost:3000',
        ],
      };
    default:
      return {
        ...DEFAULT_WIDGET_CONFIG,
        allowedOrigins: ['*'], // Только для разработки!
      };
  }
};
```

### 2. Docker конфигурация

```dockerfile
# Dockerfile для widget приложения
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Строим приложение для production
RUN npm run build

# Настраиваем nginx для обслуживания статики
FROM nginx:alpine

# Копируем конфигурацию nginx
COPY nginx/widget.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=0 /app/dist/spa /usr/share/nginx/html

# Устанавливаем правильные заголовки для iframe
RUN echo 'add_header X-Frame-Options SAMEORIGIN always;' >> /etc/nginx/conf.d/default.conf
RUN echo 'add_header Content-Security-Policy "frame-ancestors self https://*.partners.com;" always;' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. CI/CD пайплайн

```yaml
# .github/workflows/deploy-widget.yml
name: Deploy Widget

on:
  push:
    branches: [main]
    paths: ['components/desktop/**']

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd components/desktop
          npm ci

      - name: Run tests
        run: |
          cd components/desktop
          npm run test
          npm run lint
          npm run type-check

      - name: Build for production
        run: |
          cd components/desktop
          npm run build
        env:
          NODE_ENV: production
          WIDGET_ENABLED: true

      - name: Deploy to CDN
        run: |
          # Деплой статики на CDN
          aws s3 sync components/desktop/dist/spa/ s3://widget-bucket/ --delete

          # Инвалидация CloudFront кэша
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"

      - name: Update widget SDK
        run: |
          # Обновляем SDK файл
          cp components/desktop/public/monocoop-widget-sdk.js ./widget-sdk-latest.js
          aws s3 cp widget-sdk-latest.js s3://widget-bucket/monocoop-widget-sdk.js
```

### 4. Мониторинг и логирование

```typescript
// src/shared/lib/widget/monitoring.ts
export class WidgetMonitoring {
  private static instance: WidgetMonitoring;

  static getInstance() {
    if (!this.instance) {
      this.instance = new WidgetMonitoring();
    }
    return this.instance;
  }

  trackError(error: Error, context?: any) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    // Отправляем в систему мониторинга
    this.sendToMonitoring('error', errorData);
  }

  trackPerformance(metric: string, value: number) {
    const perfData = {
      metric,
      value,
      url: window.location.href,
      timestamp: Date.now(),
    };

    this.sendToMonitoring('performance', perfData);
  }

  trackUsage(action: string, data?: any) {
    const usageData = {
      action,
      data,
      url: window.location.href,
      timestamp: Date.now(),
    };

    this.sendToMonitoring('usage', usageData);
  }

  private sendToMonitoring(type: string, data: any) {
    // Отправляем данные в систему мониторинга
    fetch('/api/widget/monitoring', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    }).catch((err) => {
      console.error('Failed to send monitoring data:', err);
    });
  }
}

// Автоматический мониторинг в widget режиме
export function setupWidgetMonitoring() {
  const { isWidget } = useWidgetBridge();

  if (!isWidget.value) return;

  const monitoring = WidgetMonitoring.getInstance();

  // Отслеживание ошибок
  window.addEventListener('error', (event) => {
    monitoring.trackError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Отслеживание производительности
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;

      monitoring.trackPerformance(
        'load_time',
        perfData.loadEventEnd - perfData.loadEventStart,
      );
      monitoring.trackPerformance(
        'dom_content_loaded',
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      );
      monitoring.trackPerformance(
        'first_paint',
        performance.getEntriesByType('paint')[0]?.startTime || 0,
      );
    }, 0);
  });

  // Отслеживание использования
  monitoring.trackUsage('widget_initialized');
}
```

## Заключение

Widget система предоставляет мощные возможности для интеграции Quasar приложения в любые веб-сайты. Ключевые преимущества:

- **Простота интеграции** - минимум кода для встраивания
- **Безопасность** - валидация origin и сообщений
- **Гибкость** - настраиваемые темы и поведение
- **Производительность** - оптимизированная загрузка и рендеринг
- **Мониторинг** - полное отслеживание работы widget

Следуйте этому руководству для успешной интеграции widget системы в ваши проекты.
