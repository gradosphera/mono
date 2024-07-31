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
import { useDesktopStore } from './desktops';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


export default route(async function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;


  const desktops = useDesktopStore()
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

      const currentUser = useCurrentUserStore();
      const session = useSessionStore();

      if (!session.isAuth && !currentUser.userAccount){
        await session.init()
        if (session.isAuth)
          try{
            await currentUser.loadProfile(session.username, COOPNAME)
          } catch(e: any){
            console.error(e)
          }
      }

      if (to.name == 'index') {
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
        next(); // Продолжить переход, если доступ разрешен
      } else {
        next({ name: 'permissionDenied' }); // Перенаправить на страницу с сообщением о недостатке прав доступа
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
