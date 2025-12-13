import { User } from '../models';
import { emailService } from '../services';
import { RSendNotification } from '../types';
import catchAsync from '../utils/catchAsync';

import httpStatus from 'http-status';

export const sendNotification = catchAsync(async (req: RSendNotification, res) => {
  const { type, to, subject, message } = req.body;

  const user = await User.findOne({ username: to });

  if (user) {
    if (type === 'email') {
      await emailService.sendEmail(user.email, subject, message);
    }
  }

  res.status(httpStatus.OK).send();
});
