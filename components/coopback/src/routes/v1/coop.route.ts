import { Router } from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as coopValidation from '../../validations/coop.validation';
// import { loadAgenda, loadStaff, loadMembers } from '../../validations/coop.validation';
import * as coopController from '../../controllers/coop.controller';

const router = Router();

router.route('/agenda').get(auth('loadAgenda'), validate(coopValidation.loadAgenda), coopController.loadAgenda);
router.route('/staff').get(auth('loadStaff'), validate(coopValidation.loadStaff), coopController.loadStaff);
router.route('/members').get(auth('loadMembers'), validate(coopValidation.loadMembers), coopController.loadMembers);

router.route('/info').get(coopController.loadInfo);

export default router;
