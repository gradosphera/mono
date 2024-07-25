import { Router } from 'express';
import { paymentController } from '../../controllers';
import validate from '../../middlewares/validate';
import * as paymentValidation from '../../validations/payment.validation';
import auth from '../../middlewares/auth';
import { Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Управление платежами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ICreatedPayment:
 *       type: object
 *       required:
 *         - order_id
 *         - confirmation_token
 *       properties:
 *         order_id:
 *           type: number
 *         confirmation_token:
 *           type: string
 */

/**
 * @swagger
 * /orders/ipn:
 *   post:
 *     tags: [Orders]
 *     summary: Обработка IPN уведомления
 *     description: Маршрут для обработки IPN уведомления.
 *     responses:
 *       200:
 *         description: Успешное выполнение запроса.
 */
router.route('/ipn').post(validate(paymentValidation.RRecieveIPN), paymentController.catchIPN);

/**
 * @swagger
 * /orders/initial:
 *   post:
 *     tags: [Orders]
 *     summary: Создание регистрационного платежа
 *     description: Маршрут для создания регистрационного платежа.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ICreateInitialPayment'
 *     responses:
 *       200:
 *         description: Успешное выполнение запроса.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ICreatedPayment'
 */
router
  .route('/initial')
  .post(auth(), validate(paymentValidation.RCreateInitialPayment), paymentController.createInitialPayment);

/**
 * @swagger
 * /orders/deposit:
 *   post:
 *     tags: [Orders]
 *     summary: Создание депозита в кошелёк
 *     description: Маршрут для создания депозита.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ICreateDeposit'
 *     responses:
 *       200:
 *         description: Успешное выполнение запроса.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ICreatedPayment'
 */
router.route('/deposit').post(auth(), validate(paymentValidation.RCreateDeposit), paymentController.createDeposit);

router
  .route('/methods/:username?')
  .get(auth('getUsers'), validate(paymentValidation.RGetListPaymentMethods), paymentController.listPaymentMethods);

router
  .route('/methods/:username/add')
  .post(auth('manageUsers'), validate(paymentValidation.RSavePaymentMethod), paymentController.addPaymentMethod);

router
  .route('/methods/:username/delete')
  .post(auth('manageUsers'), validate(paymentValidation.RDeletePaymentMethod), paymentController.deletePaymentMethod);

export default router;
