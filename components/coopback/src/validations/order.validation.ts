import * as Joi from 'joi';

export const ICreateDeposit = Joi.object().keys({
  quantity: Joi.string().required(),
});

export const ICreateInitialPayment = Joi.object().keys({});

export const RCreateDeposit = {
  body: ICreateDeposit.required(),
};

export const RCreateInitialPayment = {};

export const RRecieveIPN = {
  body: Joi.object().required().unknown(true),
  params: Joi.object({ provider: Joi.string().required() }).required(),
};

export const IGetCoopOrders = Joi.object().keys({
  username: Joi.string(),
  sortBy: Joi.string().allow(''),
  limit: Joi.number().integer(),
  page: Joi.number().integer(),
  id: Joi.string(),
});

export const RGetCoopOrders = Joi.object({
  query: IGetCoopOrders,
});

export const IGetMyOrders = Joi.object().keys({
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer(),
});

export const RGetMyOrders = {
  params: Joi.object({
    username: Joi.string().required(),
  }).required(),
  query: IGetMyOrders,
};

export const RSetOrderStatus = {
  body: Joi.object()
    .keys({
      id: Joi.string().optional(),
      status: Joi.string().valid('paid', 'refunded').required(),
    })
    .required(),
};

/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateDeposit:
 *       type: object
 *       required:
 *         - username
 *         - quantity
 *       properties:
 *         username:
 *           type: string
 *         quantity:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateInitialPayment:
 *       type: object
 *       required:
 *         - username
 *       properties:
 *         username:
 *           type: string
 */
