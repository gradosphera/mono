import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    // {
    //   input: 'src/Templates/index',
    //   outDir: 'dist',
    //   name: 'Templates',
    // },
  ],
  declaration: true,
  clean: false,
  rollup: {
    emitCJS: true,
  },
})
