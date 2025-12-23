import { Router } from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import coopRoute from './coop.route';
import monoRoute from './system.route';
import dataRoute from './document.route';
import notifyRoute from './notify.route';
import methodRoute from './method.route';
import pluginRoute from './plugin.route';

const router = Router();

const defaultRoutes = [
  {
    path: '/system',
    route: monoRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/documents',
    route: dataRoute,
  },
  {
    path: '/methods',
    route: methodRoute,
  },
  {
    path: '/coop',
    route: coopRoute,
  },
  {
    path: '/notify',
    route: notifyRoute,
  },
  {
    path: '/plugins',
    route: pluginRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
