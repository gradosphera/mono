import { route } from 'quasar/wrappers';
import {
  RouteLocationNormalizedGeneric,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { routes } from 'src/app/providers/routes';
import { useSessionStore } from 'src/entities/Session';
import {
  AUTHORIZED_HOME_PAGE,
  COOPNAME,
  NOT_AUTHORIZED_HOME_PAGE,
} from 'src/shared/config';
import { IUserAccountData, useCurrentUserStore } from 'src/entities/User';
import { useMenuStore } from 'src/entities/Menu';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

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
      console.log('on router start')

      const currentUser = useCurrentUserStore();
      const session = useSessionStore();
      console.log('1')
      if (!session.isAuth && !currentUser.userAccount){
        console.log('2')
        await session.init()
        console.log('3')
        if (session.isAuth)
          try{
            console.log('4')
            await currentUser.loadProfile(session.username, COOPNAME)
            console.log('5')
          } catch(e: any){
            console.error(e)
          }

      }

      const menuStore = useMenuStore()
      menuStore.setRoutes(routes)
      console.log('6')
      if (to.name == 'index') {
        console.log('7')
        if (session.isAuth){
          console.log('8')
          next({ name: AUTHORIZED_HOME_PAGE, params: { coopname: COOPNAME } });
        } else {
          console.log('9')
          next({
            name: NOT_AUTHORIZED_HOME_PAGE,
            params: { coopname: COOPNAME },
          });
          console.log('10')
          return;
        }
      }
      console.log('11', currentUser)
      if (hasAccess(to, currentUser.userAccount)) {
        console.log('12')
        next(); // Продолжить переход, если доступ разрешен
      } else {
        console.log('12')
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
