import { Router } from 'express';
import { monoController } from '../../controllers';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { monoValidation } from '../../validations';

const router = Router();

router.route('/install').post(auth('install'), validate(monoValidation.RInstall), monoController.install);
router.route('/health').get(monoController.getHealth);

export default router;
