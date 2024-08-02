import httpStatus from 'http-status';
import { getMonoStatus } from '../services/mono.service';
import { getBlockchainInfo } from '../services/blockchain.service';
import { IHealthResponse } from '../types';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';

export const getHealth = catchAsync(async (req: Request, res: Response) => {
  const status = await getMonoStatus();
  const blockchain = await getBlockchainInfo();

  const result: IHealthResponse = {
    status,
    blockchain,
  };

  res.status(httpStatus.OK).send(result);
});
