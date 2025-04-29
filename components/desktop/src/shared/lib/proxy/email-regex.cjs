// CJS прокси для email-regex
const originalModule = require('email-regex');

// Преобразуем default export из ESM в CJS
module.exports = function emailRegex(options = {}) {
  // Проверяем, является ли оригинальный модуль функцией или объектом с default
  if (typeof originalModule === 'function') {
    return originalModule(options);
  } else if (originalModule && typeof originalModule.default === 'function') {
    return originalModule.default(options);
  } else {
    // Запасная реализация, если что-то пошло не так
    const exact = options && options.exact;
    const pattern = exact
      ? /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      : /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g;
    return pattern;
  }
};
