# Развертывание Widget System в Production

## Предварительные требования

1. **HTTPS** - обязательно для всех сайтов
2. **Правильная настройка CORS**
3. **Настройка CSP заголовков**
4. **Конфигурация allowed origins**

## Настройка серверной части

### 1. Конфигурация веб-сервера

#### Nginx

```nginx
# Добавить в server block
location /widget {
    # Разрешить встраивание в iframe для доверенных доменов
    add_header X-Frame-Options "SAMEORIGIN";
    add_header Content-Security-Policy "frame-ancestors 'self' https://trusted-domain.com https://*.trusted-domain.com";

    # CORS заголовки
    add_header Access-Control-Allow-Origin "https://trusted-domain.com";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";

    # Обработка preflight запросов
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://trusted-domain.com";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        add_header Access-Control-Max-Age 86400;
        add_header Content-Length 0;
        add_header Content-Type "text/plain charset=UTF-8";
        return 204;
    }

    try_files $uri $uri/ /index.html;
}

# Обслуживание SDK
location /monocoop-widget-sdk.js {
    add_header Access-Control-Allow-Origin "*";
    add_header Cache-Control "public, max-age=31536000";
    expires 1y;
}
```

#### Apache

```apache
# В .htaccess или конфигурации виртуального хоста
<LocationMatch "^/widget">
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Content-Security-Policy "frame-ancestors 'self' https://trusted-domain.com https://*.trusted-domain.com"
    Header always set Access-Control-Allow-Origin "https://trusted-domain.com"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</LocationMatch>

# Для SDK файла
<Files "monocoop-widget-sdk.js">
    Header always set Access-Control-Allow-Origin "*"
    Header always set Cache-Control "public, max-age=31536000"
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</Files>
```

### 2. Переменные окружения

```bash
# .env.production
NODE_ENV=production
WIDGET_ENABLED=true
WIDGET_ALLOWED_ORIGINS=https://trusted-domain.com,https://*.trusted-domain.com
WIDGET_MAX_WIDTH=1200
WIDGET_MAX_HEIGHT=800
WIDGET_TIMEOUT=30000
WIDGET_DEBUG=false
```

### 3. Конфигурация Quasar

```javascript
// quasar.config.js
module.exports = configure(function (ctx) {
  return {
    // ... существующая конфигурация

    build: {
      env: {
        // ... другие переменные
        WIDGET_ENABLED: process.env.WIDGET_ENABLED || 'false',
        WIDGET_ALLOWED_ORIGINS: process.env.WIDGET_ALLOWED_ORIGINS || '',
        WIDGET_MAX_WIDTH: process.env.WIDGET_MAX_WIDTH || '1200',
        WIDGET_MAX_HEIGHT: process.env.WIDGET_MAX_HEIGHT || '800',
      },

      // Дополнительные настройки для widget режима
      extendViteConf(viteConf) {
        // Оптимизация для встраивания
        viteConf.define = {
          ...viteConf.define,
          __WIDGET_MODE__: JSON.stringify(
            process.env.WIDGET_ENABLED === 'true',
          ),
        };
      },
    },

    // PWA настройки для widget режима
    pwa: {
      // ... существующие настройки

      // Дополнительные настройки для widget
      extendManifestJson(json) {
        if (process.env.WIDGET_ENABLED === 'true') {
          json.display_override = ['minimal-ui', 'standalone'];
          json.scope = '/widget/';
        }
      },
    },
  };
});
```

## Развертывание SDK

### 1. Создание дистрибутива SDK

```bash
# Создать отдельную сборку для SDK
npm run build:widget-sdk

# Или использовать существующий файл
cp public/monocoop-widget-sdk.js dist/
```

### 2. CDN размещение

```javascript
// Для размещения на CDN
// Добавить в index.html
<script>
  window.MonoCoopWidgetConfig = {
    cdnUrl: 'https://cdn.yoursite.com/widget/',
    version: '1.0.0',
    fallbackUrl: 'https://yoursite.com/monocoop-widget-sdk.js'
  };
</script>
```

### 3. Версионирование

```javascript
// Автоматическое версионирование
const SDK_VERSION = process.env.npm_package_version || '1.0.0';

// В SDK файле
window.MonoCoopWidget.version = '${SDK_VERSION}';
```

## Мониторинг и аналитика

### 1. Логирование

```javascript
// Добавить в widget-events.ts
export function useWidgetAnalytics() {
  const { isWidget } = useWidgetBridge();

  function trackEvent(event: string, data?: any) {
    if (isWidget.value) {
      // Отправка в аналитику
      if (typeof gtag !== 'undefined') {
        gtag('event', event, {
          event_category: 'widget',
          event_label: 'widget_interaction',
          value: data
        });
      }

      // Отправка в собственную аналитику
      fetch('/api/widget/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, timestamp: Date.now() })
      }).catch(console.error);
    }
  }

  return { trackEvent };
}
```

### 2. Мониторинг ошибок

```javascript
// Интеграция с Sentry
import * as Sentry from '@sentry/vue';

export function setupWidgetErrorTracking() {
  const { isWidget } = useWidgetBridge();

  if (isWidget.value) {
    Sentry.configureScope((scope) => {
      scope.setTag('widget_mode', true);
      scope.setContext('widget', {
        parentOrigin: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
    });
  }
}
```

## Безопасность

### 1. Валидация Origins

```javascript
// Строгая проверка origins в production
const PRODUCTION_ALLOWED_ORIGINS = [
  'https://trusted-domain.com',
  'https://subdomain.trusted-domain.com',
  'https://another-trusted-domain.com'
];

function validateOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true; // В разработке разрешаем все
  }

  return PRODUCTION_ALLOWED_ORIGINS.some(allowedOrigin => {
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.substring(2);
      return origin.endsWith(`.${domain}`) || origin === `https://${domain}`;
    }
    return origin === allowedOrigin;
  });
}
```

### 2. Содержимое Security Policy

```javascript
// Настройка CSP для widget режима
export function setupWidgetCSP() {
  const { isWidget } = useWidgetBridge();

  if (isWidget.value) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted-cdns.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.yoursite.com",
      "frame-ancestors 'self' https://trusted-domain.com",
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }
}
```

## Оптимизация производительности

### 1. Ленивая загрузка

```javascript
// Ленивая загрузка widget компонентов
export const WidgetComponents = {
  SignUp: () => import('@/pages/Registrator/SignUp/ui/SignUpWidget.vue'),
  SignIn: () => import('@/pages/Registrator/SignIn/ui/SignInWidget.vue'),
  Profile: () => import('@/pages/User/Profile/ui/ProfileWidget.vue'),
};
```

### 2. Code splitting

```javascript
// В router для widget маршрутов
const widgetRoutes = [
  {
    path: '/widget/signup',
    component: () => import('@/pages/Registrator/SignUp/ui/SignUpWidget.vue'),
    meta: { widget: true },
  },
  {
    path: '/widget/signin',
    component: () => import('@/pages/Registrator/SignIn/ui/SignInWidget.vue'),
    meta: { widget: true },
  },
];
```

### 3. Минификация и сжатие

```javascript
// В quasar.config.js
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info']
    }
  }
}
```

## Тестирование

### 1. E2E тесты для widget

```javascript
// cypress/integration/widget.spec.js
describe('Widget Integration', () => {
  it('should load widget in iframe', () => {
    cy.visit('/widget-test.html');

    cy.get('#widget-container iframe')
      .should('exist')
      .and('have.attr', 'src')
      .and('include', 'widget=true');

    cy.get('#widget-container iframe')
      .its('0.contentDocument.body')
      .should('contain', 'Регистрация');
  });

  it('should handle postMessage communication', () => {
    cy.visit('/widget-test.html');

    cy.window().then((win) => {
      win.postMessage(
        {
          type: 'widget:set-data',
          data: { test: 'value' },
        },
        '*',
      );
    });

    cy.get('#widget-container iframe')
      .its('0.contentDocument.body')
      .should('contain', 'value');
  });
});
```

### 2. Unit тесты

```javascript
// tests/unit/widget.spec.ts
import { mount } from '@vue/test-utils';
import { useWidgetBridge } from '@/shared/lib/widget';

describe('Widget Bridge', () => {
  it('should detect widget mode', () => {
    // Мокаем iframe окружение
    Object.defineProperty(window, 'parent', {
      value: {},
      writable: true,
    });

    const { isWidget } = useWidgetBridge();
    expect(isWidget.value).toBe(true);
  });
});
```

## Checklist для production

- [ ] Настроены HTTPS сертификаты
- [ ] Настроены CORS заголовки
- [ ] Настроены CSP заголовки
- [ ] Указаны конкретные allowed origins
- [ ] Настроен мониторинг ошибок
- [ ] Настроена аналитика
- [ ] Проведены E2E тесты
- [ ] Настроен CDN для SDK
- [ ] Настроено версионирование
- [ ] Настроена минификация
- [ ] Проверена производительность
- [ ] Настроены rate limits
- [ ] Настроены резервные копии
- [ ] Создана документация для пользователей

## Мониторинг в production

```javascript
// Система мониторинга
export function setupWidgetMonitoring() {
  const { isWidget } = useWidgetBridge();

  if (isWidget.value) {
    // Отправка метрик загрузки
    const loadTime = performance.now();

    // Отправка метрик использования
    setInterval(() => {
      const metrics = {
        loadTime,
        memoryUsage: performance.memory?.usedJSHeapSize,
        timestamp: Date.now(),
      };

      fetch('/api/widget/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      }).catch(console.error);
    }, 60000); // Каждую минуту
  }
}
```

## Обновления и обслуживание

1. **Версионирование API** - поддержка обратной совместимости
2. **Graceful degradation** - работа при недоступности основного сервиса
3. **Кэширование** - правильная настройка кэширования статических ресурсов
4. **Мониторинг** - отслеживание производительности и ошибок
5. **Резервные копии** - регулярные бэкапы конфигураций

## Поддержка

Для получения помощи:

1. Проверьте документацию в WIDGET_README.md
2. Проверьте примеры в public/widget-example.html
3. Посмотрите логи в браузерной консоли
4. Обратитесь к команде разработки
