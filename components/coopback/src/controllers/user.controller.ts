import http, { CREATED } from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { userService, blockchainService, tokenService, orderService } from '../services';
import { IJoinCooperative, RCreateUser, RJoinCooperative } from '../types';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import { IGetResponse } from '../types/common';

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
 * 9. Пользователь оплачивает ордер.
 * 10. Система принимает оплату и регистрирует аккаунт в блокчейне.
 * 11. (trx confirmpay) Пользователь подписывает велком-письмо с подтверждением собственноручности оплаты (транзакция в блокчейне для активации)
 */
export const createUser = catchAsync(async (req: RCreateUser, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(http.CREATED).send({ user, tokens });
});

export const joinCooperative = catchAsync(async (req: RJoinCooperative, res) => {
  await userService.joinCooperative(req.body);

  res.status(httpStatus.OK).send();
});

export const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['username', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  filter.role = { $ne: 'service' };

  const users = await userService.queryUsers(filter, options);

  const result = {} as IGetResponse; //

  //TODO wrong format answer
  const data = [] as any;
  for await (let user of users.results) {
    const json = user.toJSON();
    json.private_data = (await user.getPrivateData()) || {};
    data.push(json);
  }

  result.results = data;
  result.limit = users.limit;
  result.page = users.page;

  res.send(result);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserByUsername(req.params.username);
  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }
  const json = user.toJSON();

  json.private_data = await user.getPrivateData();

  res.send(json);
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.username, req.body);
  res.send(user);
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.username);
  res.status(http.NO_CONTENT).send();
});
