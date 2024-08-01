import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';

import { authService, tokenService, emailService } from '../services';
import { RForgotPassword, RRefreshTokens, RResetPassword, RVerifyEmail } from '../types';

const { NO_CONTENT } = httpStatus;

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

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

export const forgotPassword = catchAsync(async (req: RForgotPassword, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(NO_CONTENT).send();
});

export const resetPassword = catchAsync(async (req: RResetPassword, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(NO_CONTENT).send();
});

export const verifyEmail = catchAsync(async (req: RVerifyEmail, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(NO_CONTENT).send();
});
