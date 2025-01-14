import { Router } from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { participantValidation } from '../../validations';
import { participantController } from '../../controllers';

const router = Router();

router
  .route('/join-cooperative')
  .post(auth('joinCooperative'), validate(participantValidation.RJoinCooperative), participantController.joinCooperative);

export default router;
