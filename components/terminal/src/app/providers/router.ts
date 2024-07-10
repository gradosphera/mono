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
    (
      to: RouteLocationNormalizedGeneric,
      from: RouteLocationNormalizedGeneric,
      next: any
    ) => {
      const currentUser = useCurrentUserStore();
      const session = useSessionStore();

      if (to.name == 'index') {
        if (session.isAuth)
          next({ name: AUTHORIZED_HOME_PAGE, params: { coopname: COOPNAME } });
        else
          next({
            name: NOT_AUTHORIZED_HOME_PAGE,
            params: { coopname: COOPNAME },
          });
        return;
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
