/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

// Отключаем логи workbox в development режиме
if (process.env.NODE_ENV === 'development') {
  self.__WB_DISABLE_DEV_LOGS = true;
}

// Типы для Workbox
declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & {
    skipWaiting: () => void;
    __WB_MANIFEST: Array<{ url: string; revision: string }>;
    __WB_DISABLE_DEV_LOGS: boolean;
  };

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Очистка устаревших кэшей - вызываем после precacheAndRoute
cleanupOutdatedCaches();

// Обработка ошибок для несуществующих файлов
self.addEventListener('fetch', (event) => {
  // Проверяем если это запрос к Vue файлам
  if (event.request.url.includes('.vue')) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.warn('Файл не найден:', event.request.url, error);
        // Возвращаем пустой ответ вместо ошибки
        return new Response('', { status: 404, statusText: 'Not Found' });
      }),
    );
  }
});

// Специальные маршруты для конфигурационных файлов - всегда загружать с сервера
registerRoute(
  ({ url }) =>
    url.pathname === '/config.js' || url.pathname === '/config.default.js',
  new NetworkFirst({
    cacheName: 'config-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          // Добавляем timestamp чтобы избежать кэширования
          const url = new URL(request.url);
          url.searchParams.set('t', Date.now().toString());
          return url.toString();
        },
      },
    ],
  }),
);

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      {
        denylist: [
          // Service Worker и Workbox файлы
          /sw\.js$/,
          /workbox-(.)*\.js$/,
          // Конфигурационные файлы
          /config\.js$/,
          /config\.default\.js$/,
          // Все статические ресурсы
          /\/assets\//,
          /\.js$/,
          /\.css$/,
          /\.woff2?$/,
          /\.png$/,
          /\.jpg$/,
          /\.jpeg$/,
          /\.gif$/,
          /\.svg$/,
          /\.ico$/,
          /\.json$/,
          /\.xml$/,
          // API routes
          /\/api\//,
          /\/v1\//,
        ],
      },
    ),
  );
}

// Push уведомления
interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Обработка входящих push уведомлений
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('Push уведомление получено:', event);

  let notificationData: PushNotificationData;

  try {
    // Пытаемся извлечь данные из push уведомления
    if (event.data) {
      const rawData = event.data.text();
      notificationData = JSON.parse(rawData);
    } else {
      console.log('Нет данных в push событии, используем fallback');
      // Fallback уведомление
      notificationData = {
        title: 'Новое уведомление',
        body: 'У вас есть новое уведомление',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      };
    }
  } catch (error) {
    console.error('Ошибка парсинга push данных:', error);
    notificationData = {
      title: 'Новое уведомление',
      body: 'У вас есть новое уведомление',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    };
  }

  // Показываем уведомление
  const notificationOptions: NotificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/icon-192x192.png',
    tag: notificationData.tag || 'general',
    data: {
      url: notificationData.url || '/',
      timestamp: Date.now(),
    },
    requireInteraction: false,
    silent: false,
  };

  // Добавляем actions если поддерживаются
  if (notificationData.actions && notificationData.actions.length > 0) {
    (notificationOptions as any).actions = notificationData.actions;
  }

  console.log('Показываем уведомление с данными:', {
    title: notificationData.title,
    options: notificationOptions,
  });

  const showNotificationPromise = self.registration
    .showNotification(notificationData.title, notificationOptions)
    .then(() => {
      console.log('Уведомление успешно показано');
    })
    .catch((error) => {
      console.error('Ошибка показа уведомления:', error);
    });

  event.waitUntil(showNotificationPromise);
});

/**
 * Обработка клика по уведомлению
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Клик по уведомлению:', event);
  console.log('Notification data:', event.notification.data);

  // Закрываем уведомление
  event.notification.close();

  // Получаем URL для перехода
  const urlToOpen = event.notification.data?.url || '/';

  // Открываем или фокусируем окно браузера
  const openWindow = async () => {
    const clientList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    // Ищем уже открытое окно с нашим приложением
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        console.log('Фокусируем существующее окно');
        await client.focus();
        if ('navigate' in client) {
          await (client as any).navigate(urlToOpen);
        }
        return;
      }
    }

    // Если окна нет, открываем новое
    console.log('Открываем новое окно');
    await self.clients.openWindow(urlToOpen);
  };

  event.waitUntil(openWindow());
});
