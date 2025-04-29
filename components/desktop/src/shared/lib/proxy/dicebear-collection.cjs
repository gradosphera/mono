// Прокси-файл для @dicebear/collection
let cachedModule = null;

async function loadModule() {
  if (!cachedModule) {
    cachedModule = await import('@dicebear/collection');
  }
  return cachedModule;
}

// Экспортируем пустой объект для CommonJS
// В SSR мы можем проверять наличие функций перед их использованием
module.exports = {
  loadModule,
  // Добавляем заглушки для основных стилей
  thumbs: {},
  lorelei: {},
  bottts: {},
  avataaars: {},
  // Другие стили можно добавить при необходимости
};
