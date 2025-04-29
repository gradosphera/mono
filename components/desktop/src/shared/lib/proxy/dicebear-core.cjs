// Прокси-файл для @dicebear/core
let cachedModule = null;

async function loadModule() {
  if (!cachedModule) {
    cachedModule = await import('@dicebear/core');
  }
  return cachedModule;
}

// Экспортируем пустой объект для CommonJS
// В SSR мы можем проверять наличие функций перед их использованием
module.exports = {
  loadModule,
  // Добавляем заглушки для основных функций
  createAvatar: async function(...args) {
    const module = await loadModule();
    return module.createAvatar(...args);
  }
};
