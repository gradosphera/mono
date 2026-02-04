// Резервная конфигурация для PWA режима
// Используется когда SSR middleware недоступен
// Этот файл должен быть заменен на config.js при деплое

console.warn(
  'Используется резервная конфигурация! Убедитесь, что config.js генерируется SSR middleware',
);

window.__APP_CONFIG__ = {
  NODE_ENV: 'development',
  BACKEND_URL: 'http://localhost:3000',
  CHAIN_URL: 'http://localhost:8888',
  CHAIN_ID: 'cae86058a6d8698833afb474ab8a5ad8599c6cf54f9ebcf275dbac7055c16fe1',
  CURRENCY: 'RUB',
  COOP_SHORT_NAME: 'Цифровой Кооператив',
  SITE_DESCRIPTION: 'кооперативная экономика для сообществ и бизнеса',
  SITE_IMAGE: 'https://ia.media-imdb.com/images/rock.jpg',
  STORAGE_URL: 'http://localhost:3000/storage',
  UPLOAD_URL: 'http://localhost:3000/upload',
  TIMEZONE: 'Europe/Moscow',
  VUE_ROUTER_MODE: 'hash',
  VUE_ROUTER_BASE: '/',
  NOVU_APP_ID: '',
  NOVU_BACKEND_URL: 'https://novu.coopenomics.world/api',
  NOVU_SOCKET_URL: 'https://novu.coopenomics.world/ws',
  VAPID_PUBLIC_KEY: '',
  SENTRY_DSN: '',
};

console.log('Резервная конфигурация загружена');
