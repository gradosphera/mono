import http from 'http-status';
import catchAsync from '../utils/catchAsync';
import { paymentService } from '../services';
import {
  ICreateDeposit,
  ICreateInitialPayment,
  RDeletePaymentMethod,
  RGetListPaymentMethods,
  RSavePaymentMethod,
} from '../types';
import { Request, Response } from 'express';
import * as ip from 'ip';
import { IGetResponse } from '../types/common';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { Cooperative } from 'cooptypes';
import { getUserByUsername } from '../services/user.service';
import { User } from '../models';

// Список разрешенных IP-адресов
// const allowedIPs = [
//   '185.71.76.0/27',
//   '185.71.77.0/27',
//   '77.75.153.0/25',
//   '77.75.156.11',
//   '77.75.156.35',
//   '77.75.154.128/25',
//   '2a02:5180::/32'
// ];

// if (process.env.NODE_ENV === 'development')
//   allowedIPs.push('127.0.0.1')

export const catchIPN = catchAsync(async (req: Request, res: Response) => {
  // const ipAddr = ((req.headers['x-real-ip'] as string) || req.ip || '').replace(/^::ffff:/, '');
  // console.log("ip: ", ipAddr);

  // const isAllowed = allowedIPs.some(allowedIP => {
  //   if (allowedIP.includes('/')) { // Если это диапазон
  //     return ip.cidrSubnet(allowedIP).contains(ipAddr);
  //   }
  //   return allowedIP === ipAddr; // Если это конкретный IP
  // });

  // if (!isAllowed) {
  // console.log("попытка доступа с запрещенного IP: ", ipAddr)
  // return res.status(http.FORBIDDEN).send('Доступ запрещен');
  // }

  // console.log("on catch ipn", req.body);

  res.status(http.OK).send();
  paymentService.catchIPN(req.body);
});

export const createDeposit = catchAsync(async (req: any, res: Response) => {
  const username = req.user.username;

  const result = await paymentService.createDeposit(username, req.body as ICreateDeposit);
  res.status(http.CREATED).send(result);
});

export const createInitialPayment = catchAsync(async (req: any, res: Response) => {
  const username = req.user.username;
  const result = await paymentService.createInitialOrder(username, req.body as ICreateInitialPayment);
  res.status(http.CREATED).send(result);
});

export const listPaymentMethods = catchAsync(async (req: RGetListPaymentMethods, res) => {
  const filter = req.params?.username ? { username: req.params.username } : {};

  const methods: IGetResponse<any> = await paymentService.listPaymentMethods({ ...filter });

  res.status(httpStatus.OK).send(methods);
});

export const addPaymentMethod = catchAsync(async (req: RSavePaymentMethod, res) => {
  if (req.params?.username != req.body.username)
    throw new ApiError(httpStatus.BAD_REQUEST, 'username в params и body должны совпадать');

  const user = await getUserByUsername(req.body.username);

  const paymentData: Cooperative.Payments.IPaymentData = {
    username: req.body.username,
    method_id: req.body.method_id,
    user_type: user.type,
    method_type: req.body.method_type,
    is_default: false,
    data: req.body.data,
  };

  await paymentService.savePaymentMethod(paymentData);

  res.status(httpStatus.OK).send();
});

export const deletePaymentMethod = catchAsync(async (req: RDeletePaymentMethod, res) => {
  await paymentService.deletePaymentMethod({
    username: req.params?.username,
    method_id: req.body.method_id,
  });

  res.status(httpStatus.OK).send();
});
