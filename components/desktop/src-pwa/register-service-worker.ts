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
    },

    cached(registration) {
      console.log('Контент кэширован для офлайн использования:', registration);
    },

    updatefound(registration) {
      console.log('Найдено обновление Service Worker:', registration);
    },

    updated(registration) {
      console.log(
        'Новый контент доступен, автоматически перезагружаем:',
        registration,
      );
      // Принудительная перезагрузка без подтверждения
      window.location.reload();
    },

    offline() {
      console.log(
        'Нет подключения к интернету. Приложение работает в офлайн режиме.',
      );
    },

    error(err) {
      console.error('Ошибка регистрации Service Worker:', err);
    },
  });
}
