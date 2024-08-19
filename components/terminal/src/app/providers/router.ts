import { route } from 'quasar/wrappers';
import {
  RouteLocationNormalizedGeneric,
  RouteRecordRaw,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { routes } from 'src/app/providers/routes';
import { useSessionStore } from 'src/entities/Session';
import {
  COOPNAME,
} from 'src/shared/config';
import { IUserAccountData, useCurrentUserStore } from 'src/entities/User';
import { useDesktopStore } from '../../entities/Desktop/model';
import { useCardStore } from './card/store';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


export default route(async function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;


  const desktops = useDesktopStore()
  await desktops.healthCheck()

  const { initWallet } = useCardStore()
  await initWallet()

  const currentUser = useCurrentUserStore();
  const session = useSessionStore();

  console.log('on load desktops', currentUser)
  await desktops.loadDesktops()
  await desktops.setActiveDesktop(desktops.defaultDesktopHash)

  desktops.currentDesktop?.routes.forEach(route => {
    routes[0].children?.push(route as RouteRecordRaw)
  })

  const router = createRouter({
    history: createHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior(
      to: RouteLocationNormalizedGeneric,
      from: RouteLocationNormalizedGeneric,
      savedPosition: any
    ) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { top: 0 };
      }
    },
  });


  router.beforeEach(
    async (
      to: RouteLocationNormalizedGeneric,
      from: RouteLocationNormalizedGeneric,
      next: any
    ) => {
      console.log('on router before')
      desktops.healthCheck()

      /** проверяем установлено ли приложение и не переход ли это на страницу установки */
      if (desktops.health?.status === 'install' && to.name !== 'install') {
        /** переадресуем на страницу установки */
        next({name: 'install', params: { coopname: COOPNAME }})
        return
      }  else  if (to.name == 'index') {
        /** Если переходим на Главную, то определяем её на основе рабочего стола и имеющейся авторизации */
        if (session.isAuth){
          next({ name: desktops.currentDesktop?.authorizedHome, params: { coopname: COOPNAME } });
          return
        } else {
          next({
            name: desktops.currentDesktop?.nonAuthorizedHome,
            params: { coopname: COOPNAME },
          });
          return;
        }
      }

      if (hasAccess(to, currentUser.userAccount)) {
        /** Если переход на любую другую страницу, то проверяем права доступа к ней на основе роли и продолжаем загрузку */
        next(); // Продолжить переход, если доступ разрешен
        return
      } else {
        next({ name: 'permissionDenied' }); // Перенаправить на страницу с сообщением о недостатке прав доступа
        return
      }


    }
  );

  function hasAccess(
    to: RouteLocationNormalizedGeneric,
    userAccount: IUserAccountData | null
  ) {
    if (!to.meta?.roles || to.meta?.roles.length === 0) {
      return true; // Доступ разрешен, если массив ролей пуст
    }
    if (userAccount && to.meta?.roles.includes(userAccount.role)) {
      return true; // Доступ разрешен, если роль пользователя входит в массив разрешенных ролей
    }
    return false; // В остальных случаях доступ запрещен
  }

  return router;
});
