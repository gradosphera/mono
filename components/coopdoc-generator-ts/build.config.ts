import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/Templates/index',
    'src/Services/Generator/index',
    'src/Services/Templator/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
