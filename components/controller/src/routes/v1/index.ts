import { Router } from 'express';
import systemRoute from './system.route';

const router = Router();

const defaultRoutes = [
  {
    path: '/system',
    route: systemRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
