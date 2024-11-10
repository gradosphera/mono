import { glob } from 'glob'
// build.config.ts
import { defineBuildConfig } from 'unbuild'

// Поиск всех файлов в директории selectors и создание entry-пунктов
const selectorEntries = glob
  .sync('src/selectors/*.ts')
  // .map(file => file.replace(/\.ts$/, '')) // убираем только расширение, но оставляем src/
console.log('selectorEntries: ', selectorEntries)
export default defineBuildConfig({
  entries: [
    'src/index',
    ...selectorEntries, // Добавляем все файлы из src/selectors в entries
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
