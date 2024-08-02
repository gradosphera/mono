import * as Joi from 'joi';

import { password } from './custom.validation';

export const IRefreshTokens = Joi.object({
  refreshToken: Joi.string().required(),
});

export const RRefreshTokens = Joi.object({
  body: IRefreshTokens.required(),
});

export const IForgotPassword = Joi.object({
  email: Joi.string().email().required(),
});

export const RForgotPassword = Joi.object({
  body: IForgotPassword.required(),
});

// Внутренние параметры
export const ILogin = Joi.object({
  signature: Joi.string().required(),
  email: Joi.string().email().required(),
  now: Joi.string().required(),
});

export const ILogout = Joi.object({
  refreshToken: Joi.string().required(),
});

export const IResetPasswordQuery = Joi.object({
  token: Joi.string().required(),
});

export const IResetPasswordBody = Joi.object({
  password: Joi.string().required().custom(password),
});

export const IVerifyEmail = Joi.object({
  token: Joi.string().required(),
});

// Внешние запросы
export const RLogin = Joi.object({
  body: ILogin.required(),
});

export const RLogout = Joi.object({
  body: ILogout.required(),
});

export const RResetPassword = Joi.object({
  query: IResetPasswordQuery.required(),
  body: IResetPasswordBody.required(),
});

export const RVerifyEmail = Joi.object({
  query: IVerifyEmail.required(),
});
