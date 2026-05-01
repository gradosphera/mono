import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    // Инлайним ВСЕ зависимости в финальный bundle. Это позволяет в
    // docker-образе dicoop/bootcoop вообще не нужен node_modules —
    // только dist/index.cjs + node runtime. Иначе pnpm deploy тащит
    // .pnpm storage (~1.5GB), а npm install --omit=dev падает на
    // workspace:* specifier'ах.
    inlineDependencies: true,
  },
})
