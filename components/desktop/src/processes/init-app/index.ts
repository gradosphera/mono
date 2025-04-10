import { useDesktopStore } from 'src/entities/Desktop/model'
import { useSystemStore } from 'src/entities/System/model'
import { useInitWalletProcess } from 'src/processes/init-wallet'
import type { RouteRecordRaw, Router } from 'vue-router'
import { useBranchOverlayProcess } from '../watch-branch-overlay'
import { setupNavigationGuard } from '../navigation-guard-setup'
import { useInitExtensionsProcess } from 'src/processes/init-installed-extensions'
import type { App } from 'vue'

export async function useInitAppProcess(router: Router, app: App) {
  // загружаем статус системы с бэкенда
  const system = useSystemStore()
  await system.loadSystemInfo()


  // подгружаем рабочий стол
  const desktops = useDesktopStore()
  await desktops.healthCheck()
  await desktops.loadDesktops()

  // устанавливаем активное приложение
  desktops.setActiveDesktop(desktops.defaultDesktopHash)

  // включаем наблюдение за необходимостью выбрать кооперативный участок
  useBranchOverlayProcess()

  // инициализируем кошелек и профиль
  await useInitWalletProcess().run()


  // устанавливаем базовые маршруты.
  // TODO: занести туда где рабочие столы устанавливаются
  const baseRoute = router.getRoutes().find(route => route.name === 'base')
  if (baseRoute) {
    desktops.currentDesktop?.routes.forEach(route => {
      router.addRoute('base', route as RouteRecordRaw)
    })
  } else {
    console.error('Base route not found')
  }

  // установка навигационных гардов
  setupNavigationGuard(router)

  // установка расширений
  await useInitExtensionsProcess(app, router)

}
