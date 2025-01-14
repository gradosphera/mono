import * as Joi from 'joi';

export const ISendNotification = Joi.object({
  type: Joi.string().required().valid('email', 'push'),
  to: Joi.string().required(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
});

export const RSendNotification = Joi.object({
  body: ISendNotification.required(),
}).required();
