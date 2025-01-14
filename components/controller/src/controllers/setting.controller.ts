import { settingService } from '../services';
import catchAsync from '../utils/catchAsync';

import httpStatus from 'http-status';

export const updateSettings = catchAsync(async (req, res) => {
  const { settings } = req.body;

  await settingService.updateSettings(settings);

  res.status(httpStatus.OK).send();
});

export const getSettings = catchAsync(async (req, res) => {
  const settings = await settingService.getSettings();

  res.status(httpStatus.OK).send(settings);
});
