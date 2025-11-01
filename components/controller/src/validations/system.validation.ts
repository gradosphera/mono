import * as Joi from 'joi';
import { IIndividualData, IOrganizationData } from './user.validation';

const AgreementVar = Joi.object({
  protocol_number: Joi.string().required(),
  protocol_day_month_year: Joi.string().required(),
});

const Vars = Joi.object({
  coopname: Joi.string().required(),
  full_abbr: Joi.string().required(),
  full_abbr_genitive: Joi.string().required(),
  full_abbr_dative: Joi.string().required(),
  short_abbr: Joi.string().required(),
  website: Joi.string().required(),
  name: Joi.string().required(),
  confidential_link: Joi.string().required(),
  confidential_email: Joi.string().email().required(),
  contact_email: Joi.string().email().required(),
  passport_request: Joi.string().valid('yes', 'no').required(),
  wallet_agreement: AgreementVar.required(),
  privacy_agreement: AgreementVar.required(),
  signature_agreement: AgreementVar.required(),
  user_agreement: AgreementVar.required(),
  participant_application: AgreementVar.required(),
  coopenomics_agreement: AgreementVar.optional().allow(null),
});

export const IInstall = Joi.object({
  wif: Joi.string().required(), // поле wif - обязательная строка
  soviet: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().required().valid('chairman', 'member'), // поле role - обязательная строка с валидными значениями
        individual_data: IIndividualData.required(), // поле individual_data - обязательное
      })
    )
    .required(), // массив soviet - обязателен
  vars: Vars.required(), // переменные кооператива - обязательные
});

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

export const IInit = Joi.object({
  organization_data: IOrganizationData.required(),
  vars: ISetVars.required(),
});

export const RInit = Joi.object({
  body: IInit.required(),
});
