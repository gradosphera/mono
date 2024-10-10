import http from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { userService, tokenService, emailService, blockchainService } from '../services';
import { IAddUser, ICreateUser, RCreateUser } from '../types';
import httpStatus from 'http-status';
import pick from '../utils/pick';
// import { IGetResponse } from '../types/common';
import { IUser, userStatus } from '../types';
import { Request, Response } from 'express';
import { generateUsername } from '../../tests/utils/generateUsername';
import config from '../config/config';
import logger from '../config/logger';
// import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';

// @Route('users')
// export default class UsersController extends Controller {
//   @SuccessResponse(201, 'Created') // Указываем статус 201 и описание
//   @Post()
//   public async createUser(@Body() req: RCreateUser): Promise<{ user: IUser; tokens: any }> {
//     const user = await userService.createUser(req.body);
//     const tokens = await tokenService.generateAuthTokens(user);

//     this.setStatus(201); // Устанавливаем статус 201 Created
//     return { user, tokens }; // Возвращаем объект в ответ
//   }
// }

/**
 * Порядок регистрации:
 * 1. Пользователь вводит email и соглашается на обработку персональных данных
 * 2. Пользователь генерирует пару ключей (приватный и публичный) и имя аккаунта (12 символов)
 * 3. (createUser) Пользователь заполняет поля заявления и вызывает createUser, передавая публичный ключ, тип аккаунта (физлицо, юрлицо или ип), данные для типа и получает токен доступа.
 * 4. Система создаёт пользователя в базе данных и возвращает токен доступа
 * 5. (generate) Пользователь после получения токена автоматически запрашивает формирование заявления на вступление в кооператив
 * 6. Система генерирует заявление на вступление в кооператив и отправляет его на подпись пользователю.
 * 7. (joinCooperative) Пользователь подписывает заявление на вступление и вызывает метод joinCooperative, прикладывая подписанное заявление.
 * 8. Система сохраняет подписанное заявление
 * 9. (createInitialPayment) Пользователь получает ордер на оплату.
 * 10. Система принимает оплату и регистрирует аккаунт в блокчейне.
 * 11. (trx confirmpay) Пользователь подписывает велком-письмо с подтверждением собственноручности оплаты (транзакция в блокчейне для активации)
 * 12. Регистрация продолжается ожиданием решения совета
 */

export const createUser = catchAsync(async (req: RCreateUser, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(http.CREATED).send({ user, tokens });
});

export const addUser = catchAsync(async (req: Request, res: Response) => {
  const body: IAddUser = req.body;
  console.log('body: ', body);
  const newUser: ICreateUser = {
    ...body,
    public_key: '',
    role: 'user',
    username: generateUsername(),
  };

  const user = await userService.createUser(newUser);
  user.status = userStatus['4_Registered'];
  user.is_registered = true;
  user.has_account = true;

  await user.save();

  try {
    await blockchainService.addUser({
      ...body,
      ...newUser,
      registrator: config.coopname,
      referer: body.referer ? body.referer : '',
      coopname: config.coopname,
      meta: '',
    });

    const token = await tokenService.generateInviteToken(user.email);
    await emailService.sendInviteEmail(req.body.email, token);
  } catch (e: any) {
    logger.warn('error on add user: ', e);
    await userService.deleteUserByUsername(newUser.username);
    throw new ApiError(httpStatus.BAD_GATEWAY, e.message);
  }

  res.status(httpStatus.CREATED).send({ user });
});

export const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['username', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const users = await userService.queryUsers(filter, options);
  res.send(users);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserByUsername(req.params.username);

  res.send(user);
});

export const updateUser = catchAsync(async (req, res) => {
  if (req.user.role !== 'member' && req.user.role !== 'chairman')
    throw new ApiError(httpStatus.FORBIDDEN, 'Только председатель или член совета может обновить данные пользователя');

  const user = await userService.updateUserByUsername(req.params.username, req.body);
  res.send(user);
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserByUsername(req.params.username);
  res.status(http.NO_CONTENT).send();
});
