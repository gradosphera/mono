import { Router } from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import paymentRoute from './payment.route';
import coopRoute from './coop.route';
import monoRoute from './system.route';
import dataRoute from './document.route';
import notifyRoute from './notify.route';
import participantsRoute from './participant.route';

import config from '../../config/config';

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
    path: '/participants',
    route: participantsRoute,
  },
  {
    path: '/documents',
    route: dataRoute,
  },
  {
    path: '/payments',
    route: paymentRoute,
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
