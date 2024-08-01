import { Router } from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as coopValidation from '../../validations/coop.validation';
import * as coopController from '../../controllers/coop.controller';

const router = Router();

router.route('/agenda').get(auth('loadAgenda'), validate(coopValidation.loadAgenda), coopController.loadAgenda);
router.route('/staff').get(auth('loadStaff'), validate(coopValidation.loadStaff), coopController.loadStaff);
router.route('/info').get(auth('loadInfo'), coopController.loadInfo);

router.route('/contacts').get(coopController.loadContacts);
router.route('/health').get(coopController.getHealth);

export default router;
