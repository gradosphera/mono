import * as Joi from 'joi';

export const IGenerate = Joi.object({
  data: Joi.object({
    registry_id: Joi.number().required(),
    coopname: Joi.string().required(),
    braname: Joi.string().allow('').optional(),
    username: Joi.string().required(),
    generator: Joi.string().optional(),
    version: Joi.string().optional(),
    lang: Joi.string().valid('ru').optional(),
    created_at: Joi.string().optional(),
    block_num: Joi.number().optional(),
    timezone: Joi.string().optional(),
    links: Joi.array().items(Joi.string()).default([]),
  })
    .required()
    .unknown(true),
  options: Joi.object({
    skip_save: Joi.boolean().default(false).optional(),
  }).optional(),
}).unknown(true);

export const RGenerate = Joi.object({
  body: IGenerate.required(),
}).required();

export const IGetDocuments = Joi.object({
  filter: Joi.object({
    receiver: Joi.string().required(),
  })
    .required()
    .unknown(true),
  type: Joi.string().optional().valid('newsubmitted', 'newresolved').default('newresolved'),
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
