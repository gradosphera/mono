import http from 'http-status';
import catchAsync from '../utils/catchAsync';
import { methodService } from '../services';
import { IGetResponse } from '../types/common';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { Cooperative } from 'cooptypes';
import { getUserByUsername } from '../services/user.service';
import type { RDeletePaymentMethod, RGetListPaymentMethods, RSavePaymentMethod } from '../types';

export const listPaymentMethods = catchAsync(async (req: RGetListPaymentMethods, res) => {
  const filter = req.params?.username ? { username: req.params.username } : {};

  const methods: IGetResponse<any> = await methodService.listPaymentMethods({ ...filter });

  res.status(httpStatus.OK).send(methods);
});

export const addPaymentMethod = catchAsync(async (req: RSavePaymentMethod, res) => {
  if (req.params?.username != req.body.username)
    throw new ApiError(httpStatus.BAD_REQUEST, 'username в params и body должны совпадать');

  const user = await getUserByUsername(req.body.username);

  const method = req.body as any;

  if (method.method_type === 'sbp' && !method.data.phone)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Не указан телефон для метода СБП');

  if (method.method_type === 'bank_transfer' && !method.data.account_number)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Не верно указаны реквизиты для банковского платежа');

  const paymentData: Cooperative.Payments.IPaymentData = {
    username: req.body.username,
    method_id: String(req.body.method_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method_type: req.body.method_type,
    is_default: false,
    data: req.body.data,
  };

  await methodService.savePaymentMethod(paymentData);

  res.status(httpStatus.OK).send();
});

export const deletePaymentMethod = catchAsync(async (req: RDeletePaymentMethod, res) => {
  await methodService.deletePaymentMethod({
    username: req.params?.username,
    method_id: req.body.method_id,
  });

  res.status(httpStatus.OK).send();
});
