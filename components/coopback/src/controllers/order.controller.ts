import http from 'http-status';
import catchAsync from '../utils/catchAsync';
import { orderService } from '../services';
import { ICreateDeposit, ICreateInitialPayment } from '../types';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import logger from '../config/logger';
import { getProvider } from '../services/payment.service';

export const catchIPN = catchAsync(async (req: Request, res: Response) => {
  const providerName = req.params.provider;
  logger.info(`Recieve new IPN for provider ${providerName}`, { body: req.body, source: 'catchIPN' });

  const provider = getProvider(providerName);

  // Обрабатываем IPN данные
  await provider.handleIPN(req.body);
  res.status(200).send();
});

export const createDeposit = catchAsync(async (req: any, res: Response) => {
  const username = req.user.username;

  const result = await orderService.createDeposit(username, req.body as ICreateDeposit);
  res.status(http.CREATED).send(result);
});

export const createInitialPayment = catchAsync(async (req: any, res: Response) => {
  const username = req.user.username;
  const result = await orderService.createInitialOrder(username);
  res.status(http.CREATED).send(result);
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['username', 'id', 'order_num', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const orders = await orderService.getOrders(filter, options);
  res.status(httpStatus.OK).send(orders);
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  console.log(req.params);

  const filter = pick(req.query, ['status', 'id']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  filter.username = req.params.username;

  const orders = await orderService.getOrders(filter, options);
  res.status(httpStatus.OK).send(orders);
});

export const setStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, id } = req.body;

  await orderService.setStatus(id, status);

  res.status(httpStatus.OK).send();
});
