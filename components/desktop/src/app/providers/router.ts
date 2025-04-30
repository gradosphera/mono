// src/router/index.js
import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { routes } from 'src/app/providers/routes';
import { env } from 'src/shared/config';

// Helper function to determine router history mode
function getHistoryMode() {
  if (env.SERVER) return createMemoryHistory;
  return env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;
}

// Main route export
export default route(function () {
  const Router = createRouter({
    history: getHistoryMode()(env.VUE_ROUTER_BASE),
    routes, // Базовые маршруты
    scrollBehavior(to, from, savedPosition) {
      return savedPosition || { top: 0 };
    },
  });

  return Router;
});
