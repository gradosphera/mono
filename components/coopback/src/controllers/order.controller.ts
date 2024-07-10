import http from 'http-status';
import catchAsync from '../utils/catchAsync';
import { orderService } from '../services';
import { ICreateDeposit, ICreateInitialPayment } from '../types';
import { Request, Response } from 'express';
import * as ip from 'ip';

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
  orderService.catchIPN(req.body);
});


export const createDeposit = catchAsync(async (req: any, res: Response) => {
  const username = req.user.username

  const result = await orderService.createDeposit(username, req.body as ICreateDeposit)
  res.status(http.CREATED).send(result);
})

export const createInitialPayment = catchAsync(async (req: any, res: Response) => {
  const username = req.user.username
  const result = await orderService.createInitialOrder(username, req.body as ICreateInitialPayment)
  res.status(http.CREATED).send(result);
})

