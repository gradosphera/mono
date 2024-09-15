import httpStatus from 'http-status';
import { getMonoStatus } from '../services/system.service';
import { getBlockchainInfo } from '../services/blockchain.service';
import { IHealthResponse, IInstall, RInstall } from '../types';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { systemService } from '../services';

export const install = catchAsync(async (req: RInstall, res: Response) => {
  const { body } = req;
  await systemService.install(body as IInstall);
  res.status(httpStatus.OK).send();
});

export const getHealth = catchAsync(async (req: Request, res: Response) => {
  const status = await getMonoStatus();
  const blockchain = await getBlockchainInfo();

  const result: IHealthResponse = {
    status,
    blockchain,
  };

  res.status(httpStatus.OK).send(result);
});

export const setVars = catchAsync(async (req: Request, res: Response) => {
  res.send();
});
