import { boot } from 'quasar/wrappers';

export default boot(async () => {
  // Инициализируем network utils только если PWA включена
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_PWA_DEV === 'true'
  ) {
    // Динамически импортируем только если PWA активна
    const { initNetworkUtils } = await import('../../src-pwa/network-utils');
    initNetworkUtils();
  }
});
