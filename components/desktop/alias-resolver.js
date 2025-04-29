// Перенаправление импортов для ESM модулей в SSR
const path = require('path');
const fs = require('fs');

// Список модулей, которые нужно перенаправить
const modulesToResolve = {
  '@dicebear/core': path.resolve(__dirname, 'src/shared/lib/proxy/dicebear-core.cjs'),
  '@dicebear/collection': path.resolve(__dirname, 'src/shared/lib/proxy/dicebear-collection.cjs'),
  'email-regex': path.resolve(__dirname, 'src/shared/lib/proxy/email-regex.cjs')
};

// Проверяем, существуют ли прокси-файлы
Object.entries(modulesToResolve).forEach(([moduleName, proxyPath]) => {
  if (!fs.existsSync(proxyPath)) {
    console.error(`Прокси-файл для ${moduleName} не найден по пути ${proxyPath}`);
    process.exit(1);
  }
});

// Регистрируем перехватчик для require
require.extensions['.js'] = function(module, filename) {
  const originalCompile = module._compile;

  module._compile = function(content, filename) {
    // Заменяем импорты проблемных модулей на наши прокси
    Object.keys(modulesToResolve).forEach(moduleName => {
      const regex = new RegExp(`require\\(['"]${moduleName}['"]\\)`, 'g');
      content = content.replace(regex, `require('${modulesToResolve[moduleName]}')`);
    });

    return originalCompile.call(this, content, filename);
  };

  module._compile(fs.readFileSync(filename, 'utf8'), filename);
};
