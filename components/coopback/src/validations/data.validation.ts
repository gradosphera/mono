import * as Joi from 'joi';

export const IGenerate = Joi.object({
  code: Joi.string().required(),
  action: Joi.string().required(),
  coopname: Joi.string().required(),
  username: Joi.string().required(),
  generator: Joi.string().optional(),
  version: Joi.string().optional(),
  lang: Joi.string().valid('ru').optional(),
  created_at: Joi.string().optional(),
  block_num: Joi.number().optional(),
  timezone: Joi.string().optional(),
}).unknown(true);

export const RGenerate = Joi.object({
  body: IGenerate.required(),
}).required();

export const IGetDocuments = Joi.object({
  filter: Joi.object({
    receiver: Joi.string(),
  }),
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer(),
}).unknown(true);

export const RGetDocuments = Joi.object({
  query: IGetDocuments,
});

export const RGetMyDocuments = Joi.object({
  query: Joi.object().keys({
    username: Joi.string(),
  }),
});
