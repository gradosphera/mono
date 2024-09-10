import * as Joi from 'joi';

export const IDocument = Joi.object().keys({
  hash: Joi.string().required(),
  signature: Joi.string().required(),
  public_key: Joi.string().required(),
  meta: Joi.object().required(),
});

export const IJoinCooperative = Joi.object({
  username: Joi.string().required(),
  statement: IDocument.required(),
  wallet_agreement: IDocument.required(),
});

export const RJoinCooperative = Joi.object({
  body: IJoinCooperative.required(),
});
