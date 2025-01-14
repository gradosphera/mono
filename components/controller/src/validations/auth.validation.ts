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

export const RForgotKey = Joi.object({
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

export const IResetKeyBody = Joi.object({
  public_key: Joi.string().required(),
  token: Joi.string().required(),
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

export const RResetKey = Joi.object({
  body: IResetKeyBody.required(),
});

export const RVerifyEmail = Joi.object({
  query: IVerifyEmail.required(),
});
