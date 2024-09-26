import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as documentValidation from '../../validations/document.validation';
import { documentController } from '../../controllers';

const router = express.Router();

router
  .route('/generate')
  .post(auth('generateDocument'), validate(documentValidation.RGenerate), documentController.generateDocument);

router
  .route('/get-documents')
  .get(auth('getDocuments'), validate(documentValidation.RGetDocuments), documentController.getDocuments);

router
  .route('/get-my-documents')
  .get(auth('getMyDocuments'), validate(documentValidation.RGetDocuments), documentController.getDocuments);

export default router;
