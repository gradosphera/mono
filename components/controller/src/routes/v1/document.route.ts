import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as documentValidation from '../../validations/document.validation';
import { documentController } from '../../controllers';

const router = express.Router();

router
  .route('/generate')
  .post(auth('regenerateDocument'), validate(documentValidation.RGenerate), documentController.generateDocument);

export default router;
