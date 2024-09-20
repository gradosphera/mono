import { Router } from 'express';
import { methodController, orderController } from '../../controllers';
import validate from '../../middlewares/validate';
import { orderValidation } from '../../validations';
import auth from '../../middlewares/auth';

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
router.route('/:provider/ipn').post(validate(orderValidation.RRecieveIPN), orderController.catchIPN);

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
router.route('/initial').post(auth(), validate(orderValidation.RCreateInitialPayment), orderController.createInitialPayment);

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
router.route('/deposit').post(auth(), validate(orderValidation.RCreateDeposit), orderController.createDeposit);

router
  .route('/set-order-status')
  .post(auth('manageUsers'), validate(orderValidation.RSetOrderStatus), orderController.setStatus);

router.route('/:username?').get(auth('manageUsers'), validate(orderValidation.RGetOrders), orderController.getOrders);

export default router;
