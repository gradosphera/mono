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

export const RGetOrders = {
  params: Joi.object().keys({
    username: Joi.string().optional(),
  }),
};

export const RSetOrderStatus = {
  body: Joi.object()
    .keys({
      order_id: Joi.string().optional(),
      status: Joi.string().required(),
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
