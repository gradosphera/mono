import { register } from 'register-service-worker';

console.log('=== register-service-worker.ts загружен ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SERVICE_WORKER_FILE:', process.env.SERVICE_WORKER_FILE);
console.log('ENABLE_PWA_DEV:', process.env.ENABLE_PWA_DEV);

// Определяем, нужно ли регистрировать Service Worker
const shouldRegisterSW =
  process.env.NODE_ENV === 'production' ||
  process.env.ENABLE_PWA_DEV === 'true';

if (!shouldRegisterSW) {
  console.log('Development режим без PWA - отключаем Service Worker');

  // Отключаем существующий service worker если он есть
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      console.log('Найдено регистраций Service Worker:', registrations.length);
      for (const registration of registrations) {
        console.log('Отключаем регистрацию:', registration);
        registration.unregister();
      }
    });
  }
  // Не регистрируем новый service worker
  console.log('Service Worker не будет зарегистрирован');
} else {
  console.log('Регистрируем Service Worker (Production или PWA в Development)');
  console.log('Файл Service Worker:', process.env.SERVICE_WORKER_FILE);

  // Переменная для отслеживания обновлений
  let refreshing = false;

  // Регистрируем Service Worker
  register(process.env.SERVICE_WORKER_FILE, {
    // The registrationOptions object will be passed as the second argument
    // to ServiceWorkerContainer.register()
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

    // registrationOptions: { scope: './' },

    ready(registration) {
      console.log('Service Worker готов:', registration);
    },

    registered(registration) {
      console.log('Service Worker зарегистрирован:', registration);

      // Проверяем обновления каждые 30 секунд
      setInterval(() => {
        registration.update();
      }, 30000);
    },

    cached(registration) {
      console.log('Контент кэширован для офлайн использования:', registration);
    },

    updatefound(registration) {
      console.log('Найдено обновление Service Worker:', registration);

      // Показываем уведомление пользователю о доступном обновлении
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Обновление доступно', {
          body: 'Новая версия приложения готова к установке',
          icon: '/icons/icon-192x192.png',
        });
      }
    },

    updated(registration) {
      console.log(
        'Новый контент доступен, требуется перезагрузка:',
        registration,
      );

      // Вместо принудительной перезагрузки, обрабатываем обновление мягче
      if (!refreshing) {
        refreshing = true;

        // Ждём активации нового Service Worker
        if (registration.waiting) {
          // Сообщаем новому SW что он может активироваться
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Слушаем событие активации нового SW
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) {
            refreshing = false;
            console.log(
              'Новый Service Worker активирован, перезагружаем страницу',
            );

            // Мягкая перезагрузка с небольшой задержкой
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      }
    },

    offline() {
      console.log(
        'Нет подключения к интернету. Приложение работает в офлайн режиме.',
      );

      // Показываем уведомление об офлайн режиме
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Офлайн режим', {
          body: 'Приложение работает в автономном режиме',
          icon: '/icons/icon-192x192.png',
        });
      }
    },

    error(err) {
      console.error('Ошибка регистрации Service Worker:', err);

      // Если Service Worker не может быть зарегистрирован, продолжаем работу без него
      console.log('Приложение будет работать без Service Worker');
    },
  });

  // Обработка сообщений от Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Сообщение от Service Worker:', event.data);

      if (event.data && event.data.type === 'OFFLINE_STATUS') {
        console.log('Статус офлайн:', event.data.offline);
      }
    });
  }
}

// Функция для проверки сетевого соединения
function checkNetworkStatus() {
  if ('navigator' in window && 'onLine' in navigator) {
    console.log('Статус сети:', navigator.onLine ? 'онлайн' : 'офлайн');

    // Отправляем статус в Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'NETWORK_STATUS',
        online: navigator.onLine,
      });
    }
  }
}

// Слушаем изменения сетевого статуса
if ('addEventListener' in window) {
  window.addEventListener('online', checkNetworkStatus);
  window.addEventListener('offline', checkNetworkStatus);
}

// Проверяем статус сети при загрузке
checkNetworkStatus();
