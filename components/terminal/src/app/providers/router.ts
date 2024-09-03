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
import { COOPNAME } from 'src/shared/config';
import { IUserAccountData, useCurrentUserStore } from 'src/entities/User';
import { useDesktopStore } from '../../entities/Desktop/model';
import { useCardStore } from './card/store';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to determine router history mode
function getHistoryMode() {
  if (process.env.SERVER) return createMemoryHistory;
  return process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;
}

// Helper function to initialize stores
async function initializeStores() {
  const desktops = useDesktopStore();
  const { initWallet } = useCardStore();

  await desktops.healthCheck();
  await desktops.loadDesktops()
  await desktops.setActiveDesktop(desktops.defaultDesktopHash)

  await initWallet();
  return { desktops, initWallet };
}

// Function to set up router instance
function setupRouter(desktops) {
  desktops.currentDesktop?.routes.forEach(route => {
    routes[0].children?.push(route as RouteRecordRaw);
  });

  return createRouter({
    history: getHistoryMode()(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior(to, from, savedPosition) {
      return savedPosition || { top: 0 };
    },
  });
}

// Function to handle access logic
function hasAccess(to: RouteLocationNormalizedGeneric, userAccount: IUserAccountData | null) {
  if (!to.meta?.roles || to.meta?.roles.length === 0) {
    return true; // Access is allowed if no roles are defined
  }
  return userAccount && to.meta?.roles.includes(userAccount.role); // Check user roles against route roles
}

// Function to handle router navigation guards
function setupNavigationGuards(router, desktops, session, currentUser) {
  router.beforeEach(async (to, from, next) => {

    await desktops.healthCheck();

    if (desktops.health?.status === 'install' && to.name !== 'install') {
      next({ name: 'install', params: { coopname: COOPNAME } });
      return;
    }

    if (to.name === 'index') {
      const homePage = session.isAuth && currentUser.isRegistrationComplete
        ? desktops.currentDesktop?.authorizedHome
        : desktops.currentDesktop?.nonAuthorizedHome;

      next({ name: homePage, params: { coopname: COOPNAME } });
      return;
    }

    if (hasAccess(to, currentUser.userAccount)) {
      next();
    } else {
      next({ name: 'permissionDenied' });
    }
  });
}

// Main route export
export default route(async function () {
  const { desktops } = await initializeStores();
  const router = setupRouter(desktops);
  const currentUser = useCurrentUserStore();
  const session = useSessionStore();

  setupNavigationGuards(router, desktops, session, currentUser);

  return router;
});
