import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';

import { authService, tokenService } from '../services';
import { RForgotKey, RRefreshTokens, RResetKey, RVerifyEmail } from '../types';

const { NO_CONTENT } = httpStatus;

export const login = catchAsync(async (req, res) => {
  const { now, signature, email } = req.body;

  const user = await authService.loginUserWithSignature(email, now, signature);

  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: RRefreshTokens, res: any) => {
  const tokens = await authService.refreshAuth(req.body);
  res.send(tokens);
});

export const lostKey = catchAsync(async (req: RForgotKey, res) => {
  // await authService.startResetKey(req.body);
  // res.status(NO_CONTENT).send();
});

export const resetKey = catchAsync(async (req: RResetKey, res) => {
  // await authService.resetKey(req.body.token, req.body.public_key);
  // res.status(NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(async (req, res) => {
  // await authService.sendVerificationEmail(req.user.username);
  // res.status(NO_CONTENT).send();
});

export const verifyEmail = catchAsync(async (req: RVerifyEmail, res) => {
  // await authService.verifyEmail(req.query.token);
  // res.status(NO_CONTENT).send();
});
