import { Router } from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as userController from '../../controllers/user.controller';
import { userValidation } from '../../validations';

const router = Router();

router
  .route('/')
  .post(validate(userValidation.RCreateUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.RGetUsers), userController.getUsers);

router.route('/join-cooperative').post(validate(userValidation.RJoinCooperative), userController.joinCooperative);

router.route('/add').post(auth('addUser'), validate(userValidation.RAddUser), userController.addUser);

router
  .route('/:username')
  .get(auth('getUsers'), validate(userValidation.RGetUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.RUpdateUser), userController.updateUser);

export default router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать пользователя
 *     description: Только администраторы могут создавать новых пользователей.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ICreateUser'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Получить всех пользователей
 *     description: Только администратор может получить всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Системное имя пользователя
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Роль пользователя
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Сортировка по полю в формате field:desc/asc (например, name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Максимальное количество пользователей
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Получить пользователя
 *     description: Авторизованные пользователи могут получать только свою собственную информацию. Только администраторы могут получать информацию о других пользователях.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор пользователя
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Обновить пользователя
 *     description: Только администраторы могут обновлять информацию о других пользователях.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Системное имя пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: должен быть уникальным
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Минимум одна цифра и одна буква
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
