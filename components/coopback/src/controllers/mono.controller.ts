import httpStatus from 'http-status';
import { getMonoStatus } from '../services/mono.service';
import { getBlockchainInfo } from '../services/blockchain.service';
import { IHealthResponse, IInstall, RInstall } from '../types';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { monoService } from '../services';

export const install = catchAsync(async (req: RInstall, res: Response) => {
  const { body } = req;
  await monoService.install(body as IInstall);
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
