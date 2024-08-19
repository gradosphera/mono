import http from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { userService, tokenService, emailService, blockchainService } from '../services';
import { IAddUser, ICreateUser, RCreateUser, RJoinCooperative } from '../types';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import { IGetResponse } from '../types/common';
import { IUser } from '../models/user.model';
import { Request, Response } from 'express';
import { generateUsername } from '../../tests/utils/generateUsername';
import config from '../config/config';
import logger from '../config/logger';

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

  const newUser: ICreateUser = {
    ...body,
    public_key: '',
    role: 'user',
    username: generateUsername(),
  };

  const user = await userService.createUser(newUser);
  user.status = 'registered';
  user.is_registered = true;
  await user.save();

  try {
    await blockchainService.addUser({
      ...body,
      ...newUser,
      registrator: config.service_username,
      referer: body.referer ? body.referer : '',
      coopname: config.coopname,
      meta: '',
    });
    console.log('user: ', user);
    const token = await tokenService.generateInviteToken(user.email);
    await emailService.sendInviteEmail(req.body.email, token);
  } catch (e: any) {
    console.log('on e: ', e);
    logger.warn('error on add user: ', e);
    await userService.deleteUserByUsername(newUser.username);
    throw new ApiError(httpStatus.BAD_GATEWAY, e.message);
  }

  res.status(httpStatus.CREATED).send({ user });
});

export const joinCooperative = catchAsync(async (req: RJoinCooperative, res) => {
  await userService.joinCooperative(req.body);

  res.status(httpStatus.OK).send();
});

export const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['username', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const users = await userService.queryUsers(filter, options);
  const result = {} as IGetResponse<IUser>;

  const data = [] as any;
  for await (const user of users.results) {
    const json = user.toJSON();
    if (user.type != 'service') {
      json.private_data = await user.getPrivateData();
      data.push(json);
    }
  }

  result.results = data;
  result.limit = users.limit;
  result.page = users.page;
  result.totalPages = users.totalPages;
  result.totalResults = users.totalResults;

  res.send(result);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserByUsername(req.params.username);
  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }
  const json = user.toJSON();

  if (user.type != 'service') {
    json.private_data = await user.getPrivateData();
  }

  res.send(json);
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
