import { Router } from 'express';
import { systemController } from '../../controllers';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { systemValidation } from '../../validations';

const router = Router();

router.route('/install').post(auth('install'), validate(systemValidation.RInstall), systemController.install);

router.route('/get-vars-schema').post(auth(), systemController.getVarsSchema);

router.route('/set-vars').post(auth('set-vars'), validate(systemValidation.RSetVars), systemController.setVars);
router.route('/get-vars').post(auth(), validate(systemValidation.RSetVars), systemController.setVars);

router.route('/health').get(systemController.getHealth);

export default router;
