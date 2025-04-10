import { boot } from 'quasar/wrappers'
import { useInitAppProcess } from 'src/processes/init-app'

export default boot(async ({ router, app }) => {
  await useInitAppProcess(router, app)
})
