import * as Joi from 'joi';

export const ISetPlugin = Joi.object({
  name: Joi.string().required(),
  enabled: Joi.boolean().required(),
  config: Joi.object().optional(),
});

export const RSetPlugin = Joi.object({
  body: ISetPlugin.required(),
});

export const IGetPluginSchema = Joi.object({
  name: Joi.string().required(),
});

export const RGetPluginSchema = Joi.object({
  query: IGetPluginSchema.required(),
});

export const IGetPluginConfig = Joi.object({
  name: Joi.string().required(),
});

export const RGetPluginConfig = Joi.object({
  query: IGetPluginConfig.required(),
});

export const IGetPluginList = Joi.object({
  name: Joi.string().required(),
  limit: Joi.number().integer(),
  page: Joi.number().integer(),
});

export const RGetPluginList = Joi.object({
  query: IGetPluginConfig,
});
