import { Router } from 'express';
import validate from '../../middlewares/validate';

import auth from '../../middlewares/auth';
import { notifyController } from '../../controllers';
import { notifyValidation } from '../../validations';

const router = Router();

router.post(
  '/send',
  auth('sendNotification'),
  validate(notifyValidation.RSendNotification),
  notifyController.sendNotification
);

export default router;
