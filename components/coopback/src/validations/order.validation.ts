import * as Joi from 'joi';

export const ICreateDeposit = Joi.object().keys({
  quantity: Joi.string().required(),
  provider: Joi.string().valid('yookassa').required()
})

export const ICreateInitialPayment = Joi.object().keys({
  provider: Joi.string().valid('yookassa').required()
})

export const RCreateDeposit = {
  body: ICreateDeposit.required(),
}

export const RCreateInitialPayment = {
  body: ICreateInitialPayment.required(),
}


export const IRecieveIPN = Joi.object({
  type: Joi.string().required(),
  event: Joi.string().required(),
  object: Joi.object({
    id: Joi.string().required(),
    status: Joi.string().required(),
    paid: Joi.boolean().required(),
    amount: Joi.object({
      value: Joi.string().required(),
      currency: Joi.string().required(),
    }).required().unknown(true),
    income_amount: Joi.object({
      value: Joi.string().required(),
      currency: Joi.string().required(),
    }).required().unknown(true),
    refunded_amount: Joi.object({
      value: Joi.string().required(),
      currency: Joi.string().required(),
    }).required().unknown(true),
    authorization_details: Joi.object({
      rrn: Joi.string(),
      auth_code: Joi.string(),
      three_d_secure: Joi.object({
        applied: Joi.boolean(),
      }).unknown(true),
    }).unknown(true),
    created_at: Joi.string(),
    description: Joi.string(),
    expires_at: Joi.string(),
    metadata: Joi.object().pattern(Joi.string(), Joi.any()),
    payment_method: Joi.object({
      type: Joi.string().required(),
      id: Joi.string().required(),
      saved: Joi.boolean(),
      card: Joi.object({
        first6: Joi.string(),
        last4: Joi.string(),
        expiry_month: Joi.string(),
        expiry_year: Joi.string(),
        card_type: Joi.string(),
        issuer_country: Joi.string(),
        issuer_name: Joi.string(),
      }).unknown(true),
      title: Joi.string(),
    }).required().unknown(true),
    refundable: Joi.boolean(),
    test: Joi.boolean(),
  }).required().unknown(true),
});

export const RRecieveIPN = {
  body: IRecieveIPN.required()
}

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
