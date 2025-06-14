import { useDesktopStore } from 'src/entities/Desktop/model'
import { useSystemStore } from 'src/entities/System/model'
import { useInitWalletProcess } from 'src/processes/init-wallet'
import type { Router } from 'vue-router'
import { useBranchOverlayProcess } from '../watch-branch-overlay'
import { setupNavigationGuard } from '../navigation-guard-setup'
import { useInitExtensionsProcess } from 'src/processes/init-installed-extensions'
import { applyThemeFromStorage } from 'src/shared/lib/utils'

export async function useInitAppProcess(router: Router) {
  applyThemeFromStorage()
  const system = useSystemStore()
  await system.loadSystemInfo()

  const desktops = useDesktopStore()
  await desktops.healthCheck()
  await desktops.loadDesktop()

  // Выбираем активный рабочий стол (например, participant)
  desktops.selectWorkspace('participant')

  useBranchOverlayProcess()
  await useInitWalletProcess().run()

  // Регистрируем маршруты рабочего стола
  desktops.registerWorkspaceMenus(router)

  setupNavigationGuard(router)

  await useInitExtensionsProcess(router)
}
