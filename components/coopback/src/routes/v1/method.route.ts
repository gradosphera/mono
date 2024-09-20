import { Router } from 'express';
import { methodController } from '../../controllers';
import validate from '../../middlewares/validate';
import { methodValidation } from '../../validations';
import auth from '../../middlewares/auth';

const router = Router();

router
  .route('/:username?')
  .get(auth('manageUsers'), validate(methodValidation.RGetListPaymentMethods), methodController.listPaymentMethods);

router
  .route('/:username/add')
  .post(auth('manageUsers'), validate(methodValidation.RSavePaymentMethod), methodController.addPaymentMethod);

router
  .route('/:username/delete')
  .post(auth('manageUsers'), validate(methodValidation.RDeletePaymentMethod), methodController.deletePaymentMethod);

export default router;
