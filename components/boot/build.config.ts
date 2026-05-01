import { builtinModules } from 'node:module'
import { defineBuildConfig } from 'unbuild'

// Полный bundle всех deps в один dist/index.cjs — для docker-образа
// dicoop/bootcoop, чтобы в финальном слое не нужен был node_modules.
//
// `rollup.inlineDependencies: true` декларирует намерение, но в unbuild 2
// есть баг: он добавляет всё из pkg.dependencies в externals ДО проверки
// inlineDependencies. Поэтому hook 'rollup:options' переопределяет
// external напрямую — external только built-ins.
export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  hooks: {
    'rollup:options'(_ctx, options) {
      const builtins = new Set([
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ])
      options.external = (id) => {
        if (builtins.has(id) || id.startsWith('node:'))
          return true
        return false
      }
    },
  },
})
