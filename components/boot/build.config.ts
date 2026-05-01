import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    // Инлайним workspace-deps в финальный bundle. Это позволяет в
    // docker-образе dicoop/bootcoop ставить только npm-зависимости через
    // `npm install --omit=dev` без workspace-контекста — иначе pnpm
    // deploy тащит весь .pnpm storage (~1.5GB).
    inlineDependencies: ['cooptypes', '@coopenomics/factory'],
  },
})
