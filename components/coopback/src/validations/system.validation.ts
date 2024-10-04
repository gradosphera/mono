import * as Joi from 'joi';
import { IIndividualData } from './user.validation';

export const IInstall = Joi.array().items(
  Joi.object({
    role: Joi.string().required().valid('chairman', 'member'),
    individual_data: IIndividualData.required(),
  })
);

export const RInstall = Joi.object({
  body: IInstall.required(),
});

export const ISetWif = Joi.object({
  username: Joi.string().required(),
  permission: Joi.string().required().valid('active'),
  wif: Joi.string().required(),
});

export const RSetWif = Joi.object({
  body: ISetWif.required(),
});

export const ISetVars = Joi.object({
  coopname: Joi.string().required(),
  full_abbr: Joi.string().required(),
  full_abbr_genitive: Joi.string().required(),
  full_abbr_dative: Joi.string().required(),
  short_abbr: Joi.string().required(),
  website: Joi.string().required(),
  name: Joi.string().required(),
  confidential_link: Joi.string().required(),
  confidential_email: Joi.string().required(),
  contact_email: Joi.string().required(),
  passport_request: Joi.string().required().valid('yes', 'no'),
  wallet_agreement: Joi.object({
    protocol_number: Joi.string().required(),
    protocol_day_month_year: Joi.string().required(),
  }).required(),
  signature_agreement: Joi.object({
    protocol_number: Joi.string().required(),
    protocol_day_month_year: Joi.string().required(),
  }).required(),
  privacy_agreement: Joi.object({
    protocol_number: Joi.string().required(),
    protocol_day_month_year: Joi.string().required(),
  }).required(),
  user_agreement: Joi.object({
    protocol_number: Joi.string().required(),
    protocol_day_month_year: Joi.string().required(),
  }).required(),
  participant_application: Joi.object({
    protocol_number: Joi.string().required(),
    protocol_day_month_year: Joi.string().required(),
  }).required(),
}).unknown(true);

export const RSetVars = Joi.object({
  body: ISetVars.required(),
});

export const RUpdateSettings = Joi.object({
  body: Joi.object({
    settings: Joi.object().required(),
  }).required(),
});
