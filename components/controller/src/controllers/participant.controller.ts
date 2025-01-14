import httpStatus from 'http-status';
import { participantService } from '../services';
import type { RJoinCooperative } from '../types';
import catchAsync from '../utils/catchAsync';

export const joinCooperative = catchAsync(async (req: RJoinCooperative, res) => {
  await participantService.joinCooperative(req.body);

  res.status(httpStatus.OK).send();
});
