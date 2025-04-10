import { boot } from 'quasar/wrappers'
import { App } from 'vue'
import { Router } from 'vue-router'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default boot(({ app, router }: { app: App<Element>; router: Router }) => {
  // Пример инициализации компонента
  // app.component('MyExtensionComponent', () => import('./MyExtensionComponent.vue'))

  // Пример добавления маршрута, если нужно
  // router.addRoute({
  //   path: '/my-extension',
  //   component: () => import('./MyExtensionPage.vue')
  // })

  console.log('Расширение powerup загружено успешно')
})
