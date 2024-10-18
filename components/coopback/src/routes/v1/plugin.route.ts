import { Router } from 'express';
import { pluginController } from '../../controllers';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { pluginValidation } from '../../validations';

const router = Router();

router.route('/').post(auth('setPlugin'), validate(pluginValidation.RSetPlugin), pluginController.setPluginConfig);
router.route('/').get(auth('setPlugin'), validate(pluginValidation.RGetPluginList), pluginController.getPluginList);

router
  .route('/schema')
  .get(auth('setPlugin'), validate(pluginValidation.RGetPluginSchema), pluginController.getPluginSchema);

router
  .route('/config')
  .get(auth('setPlugin'), validate(pluginValidation.RGetPluginConfig), pluginController.getPluginConfig);

export default router;
