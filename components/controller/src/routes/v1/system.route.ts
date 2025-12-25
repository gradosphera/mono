import { Router } from 'express';
import httpStatus from 'http-status';

const router = Router();

router.route('/health').get((_req, res) => res.status(httpStatus.OK).send('OK'));

export default router;
