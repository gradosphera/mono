import httpStatus from 'http-status';
import { getMonoStatus } from '../services/system.service';
import { getBlockchainInfo } from '../services/blockchain.service';
import { IHealthResponse, IInstall, RInstall } from '../types';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { systemService } from '../services';
import type { ISetVars, RSetVars, RSetWif } from '../types/auto-generated/system.validation';
import logger from '../config/logger';
import Vault from '../models/vault.model';

export const install = catchAsync(async (req: RInstall, res: Response) => {
  const { body } = req;
  await systemService.install(body as IInstall);

  logger.info('System installed', { source: 'install', vars: req.body });

  res.status(httpStatus.OK).send();
});

export const setWif = catchAsync(async (req: RSetWif, res: Response) => {
  await systemService.setWif(req.body);
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

export const setVars = catchAsync(async (req: RSetVars, res: Response) => {
  await systemService.setVars(req.body as ISetVars);
  res.status(httpStatus.OK).send();
});

export const getVarsSchema = catchAsync(async (req: RSetVars, res: Response) => {
  const schema = await systemService.getVarsSchema();
  res.status(httpStatus.OK).send(schema);
});

export const getVars = catchAsync(async (req: RSetVars, res: Response) => {
  const vars = await systemService.getVars();
  res.status(httpStatus.OK).send(vars);
});
