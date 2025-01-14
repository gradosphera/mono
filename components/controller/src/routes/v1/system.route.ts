import { Router } from 'express';
import { settingController, systemController } from '../../controllers';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { systemValidation } from '../../validations';

const router = Router();

//init - устанавливает данные организации кооператива
router.route('/init').post(auth('init'), validate(systemValidation.RInit), systemController.init);

router.route('/install').post(validate(systemValidation.RInstall), systemController.install);

router.route('/wif').post(auth('setWif'), validate(systemValidation.RSetWif), systemController.setWif);

//wif

router.route('/vars/schema').get(auth('getVars'), systemController.getVarsSchema);
router.route('/vars').get(auth('getVars'), systemController.getVars);
router.route('/vars').post(auth('setVars'), validate(systemValidation.RSetVars), systemController.setVars);

router.route('/health').get(systemController.getHealth);

router.route('/settings').get(auth('manageSettings'), settingController.getSettings);

router
  .route('/settings')
  .post(auth('manageSettings'), validate(systemValidation.RUpdateSettings), settingController.updateSettings);

export default router;
