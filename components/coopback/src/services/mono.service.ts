import httpStatus from 'http-status';
import { Mono } from '../models';
import ApiError from '../utils/ApiError';
import config from '../config/config';
import logger from '../config/logger';
import { IHealthStatus } from '../types';

export const init = async (): Promise<void> => {
  const mono = await Mono.findOne({ coopname: config.coopname });

  if (!mono)
    await Mono.create({
      coopname: config.coopname,
      status: 'install',
    });

  logger.info('MONO инициализирован');
};

export const getMonoStatus = async (): Promise<IHealthStatus> => {
  const mono = await Mono.findOne({ coopname: config.coopname });

  if (!mono) throw new ApiError(httpStatus.BAD_REQUEST, 'Установщик не найден');

  return mono.status;
};
