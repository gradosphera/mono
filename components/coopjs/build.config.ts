import { glob } from 'glob'
// build.config.ts
import { defineBuildConfig } from 'unbuild'

// Поиск всех файлов в директории selectors и создание entry-пунктов
const queriesEntries = glob
  .sync('src/queries/*.ts')

const mutationEntries = glob
  .sync('src/mutations/*.ts')

  
export default defineBuildConfig({
  entries: [
    'src/index',
    ...queriesEntries, // Добавляем все файлы из src/queries в entries
    ...mutationEntries
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
