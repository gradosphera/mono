import { Router } from 'vue-router'
import { useSessionStore } from 'src/entities/Session'
import { useCurrentUserStore } from 'src/entities/User'
import { useDesktopStore } from 'src/entities/Desktop/model'
import { useSystemStore } from 'src/entities/System/model'
import { LocalStorage } from 'quasar'

function hasAccess(to, userAccount) {
  if (!to.meta?.roles || to.meta?.roles.length === 0) return true
  return userAccount && to.meta?.roles.includes(userAccount.role)
}

// Функция для получения URL для редиректа
function getRedirectUrl(router: Router, to: any): string {
  if (process.env.CLIENT) {
    return router.resolve(to).href
  }
  return ''
}

export function setupNavigationGuard(router: Router) {
  const desktops = useDesktopStore()
  const session = useSessionStore()
  const currentUser = useCurrentUserStore()
  const { info } = useSystemStore()

  router.beforeEach(async (to, from, next) => {
    await desktops.healthCheck()

    // если требуется установка
    if (desktops.health?.status === 'install' && to.name !== 'install') {
      next({ name: 'install', params: { coopname: info.coopname } })
      return
    }

    // редирект с index
    if (to.name === 'index') {
      // Убеждаемся, что правильный рабочий стол выбран
      if (session.isAuth && currentUser.isRegistrationComplete) {
        // Если рабочий стол не выбран - выбираем по правам пользователя
        if (!desktops.activeWorkspaceName) {
          desktops.selectDefaultWorkspace()
        }

        // Переходим на маршрут по умолчанию для выбранного рабочего стола
        desktops.goToDefaultPage(router)
        // next(false)
        return
      } else {
        // Если пользователь не авторизован, используем nonAuthorizedHome
        const homePage = desktops.currentDesktop?.nonAuthorizedHome
        next({ name: homePage, params: { coopname: info.coopname } })
        return
      }
    }

    // Проверка авторизации для маршрутов, требующих входа
    if (to.meta?.requiresAuth && !session.isAuth) {
      // Сохраняем целевой URL для редиректа после входа
      if (process.env.CLIENT) {
        // Получаем URL для редиректа
        const redirectUrl = getRedirectUrl(router, to)
        LocalStorage.set('redirectAfterLogin', redirectUrl)
      }
      // Перенаправляем на страницу входа
      next({ name: 'login-redirect', params: { coopname: info.coopname } })
      return
    }

    // проверка по ролям
    if (hasAccess(to, currentUser.userAccount)) {
      next()
    } else {
      next({ name: 'permissionDenied' })
    }
  })
}
