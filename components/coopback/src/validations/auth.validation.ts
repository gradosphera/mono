import * as Joi from 'joi';

import { password } from './custom.validation'

export const login = Joi.object({
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
})

export const logout = Joi.object({
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
})

export const refreshTokens = Joi.object({
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
})

export const forgotPassword = Joi.object({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
})

export const resetPassword = Joi.object({
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
})

export const verifyEmail = Joi.object({
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
})
