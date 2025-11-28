import { Router } from 'express';
import { systemController } from '../../controllers';

const router = Router();

router.route('/health').get(systemController.getHealth);

export default router;
