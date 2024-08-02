import { Router } from 'express';
import { monoController } from '../../controllers';

const router = Router();

router.route('/health').get(monoController.getHealth);

export default router;
