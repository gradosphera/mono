import * as Joi from 'joi';

export const loadAgenda = Joi.object({
  query: Joi.object().keys({
    coopname: Joi.string().required(),
  }),
});

export const loadStaff = Joi.object({
  query: Joi.object().keys({
    coopname: Joi.string().required(),
  }),
});
