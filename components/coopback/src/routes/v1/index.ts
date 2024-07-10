import { Router } from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import orderRoute from './order.route';
import coopRoute from './coop.route';
import dataRoute from './data.route';
import notifyRoute from './notify.route';

import config from '../../config/config';

const router = Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/data',
    route: dataRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/coop',
    route: coopRoute,
  },
  {
    path: '/notify',
    route: notifyRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
