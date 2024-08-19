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
