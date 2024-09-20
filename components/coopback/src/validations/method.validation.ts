import Joi from 'joi';

const RussianBankDetailsSchema = Joi.object({
  bik: Joi.string().required(),
  corr: Joi.string().required(),
  kpp: Joi.string().required(),
});

export const IBankAccount = Joi.object({
  currency: Joi.string().required().valid('RUB', 'Other'),
  card_number: Joi.string().default(''),
  bank_name: Joi.string().required(),
  account_number: Joi.string().required(),
  details: RussianBankDetailsSchema.required(),
});

export const ISbpDetails = Joi.object({
  phone: Joi.string().required(),
});

export const RGetListPaymentMethods = Joi.object({
  params: {
    username: Joi.string().optional(),
  },
});

const MethodTypes = Joi.string().valid('sbp', 'bank_transfer');

export const ISavePaymentMethod = Joi.object({
  username: Joi.string().required(),
  method_id: Joi.number().required(),
  method_type: MethodTypes.required(),
  data: Joi.alternatives().try(ISbpDetails, IBankAccount).required(),
});

export const RSavePaymentMethod = Joi.object({
  params: {
    username: Joi.string().required(),
  },
  body: ISavePaymentMethod.required(),
});

export const IDeletePaymentMethod = Joi.object({
  method_id: Joi.number().required(),
});

export const RDeletePaymentMethod = Joi.object({
  params: {
    username: Joi.string().required(),
  },
  body: IDeletePaymentMethod.required(),
});
