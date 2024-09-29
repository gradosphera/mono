import { Router } from 'express';
import { settingController, systemController } from '../../controllers';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { systemValidation } from '../../validations';

const router = Router();

router.route('/install').post(auth('install'), validate(systemValidation.RInstall), systemController.install);

router.route('/get-vars-schema').post(auth('getVars'), systemController.getVarsSchema);
router.route('/get-vars').post(auth('getVars'), systemController.setVars);

router.route('/set-vars').post(auth('setVars'), validate(systemValidation.RSetVars), systemController.setVars);

router.route('/health').get(systemController.getHealth);

router.route('/settings').get(auth('manageSettings'), settingController.getSettings);

router
  .route('/settings')
  .post(auth('manageSettings'), validate(systemValidation.RUpdateSettings), settingController.updateSettings);

export default router;
